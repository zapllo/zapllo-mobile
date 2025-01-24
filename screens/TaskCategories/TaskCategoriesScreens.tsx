import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Platform, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import GradientButton from '~/components/GradientButton';
import CategoryComponent from '../../components/Dashboard/CategoryComponent';
import Navbar from '~/components/navbar';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { backend_Host } from '~/config';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

export default function TaskCategories() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [taskDescription, setTaskDescription] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; isEditing: boolean }[]>([]);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [AiModalOpen, SetAiModalOpen] = useState(false);
  const [AiSelectedItems, setAiSelectedItems] = useState<number[]>([]);
  const[aiCategories,setAiCategories]=useState([])
  

useEffect(()=>{
fetchCategories();
handleSuggestCategories()
},[token])

useEffect(() => {
  const search = taskDescription?.toLowerCase();
  const filtered = categories?.filter((category) =>
    category?.name?.toLowerCase().includes(search)
  );
  setFilteredCategories(filtered);
}, [taskDescription, categories]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const addNewCategory = () => {
    setCategories([...categories, { name: ``, isEditing: true }]);
  };

  const toggleAiSelection = (index: number) => {
    setAiSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(index)
        ? prevSelectedItems.filter((item) => item !== index) 
        : [...prevSelectedItems, index] 
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); 
  };

  const confirmAndSaveCategories = async () => {
    
    const selectedCategories = AiSelectedItems.map((index) => aiCategories[index]);
  
    if (selectedCategories.length === 0) {
      Alert.alert('No Selection', 'Please select at least one category.');
      return;
    }
  
    for (const category of selectedCategories) {
       await handleAddCategory(category);
       fetchCategories()        
    }
  
    SetAiModalOpen(false);
  };
  
 

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backend_Host}/category/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const formattedCategories = response?.data?.data?.map((category: any) => ({
        id: category?._id,
        name: category?.name,
        isEditing: false,
      }));
  
      setCategories(formattedCategories);
      setFilteredCategories(formattedCategories);
    } catch (err: any) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('API Error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = (id: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === id
          ? { ...category, isEditing: !category.isEditing }
          : { ...category, isEditing: false }
      )
    );
  };
  const handleAddCategory = async (cat:string) => {
    console.log('Category created:❌❌❌❌❌❌❌❌❌❌❌❌❌❌111111');
    if (!cat) {
      Alert.alert('Validation Error', 'Enter new category');
      return;
    }
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${backend_Host}/category/create`,
        {
          name: cat, 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newCategoryy = response.data; // Access the new category details from the response
      console.log("newww>>>>>>>>",newCategoryy)
      fetchCategories();
      
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Failed to create category. Please try again.');
    }finally{
      setIsLoading(false)
    }
  };

  const handleSuggestCategories = async () => {

    try {
      const response = await axios.post(
        `${backend_Host}/category/suggest`,
        {
        "industry": "Technology"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const suggestCategoryy = response?.data?.categories; // Access the new category details from the response
      setAiCategories(suggestCategoryy)
    } catch (error) {
      console.error('Error suggeting categories:', error);
      Alert.alert('Failed to suggest category. Please try again.');
    }finally{
    }
  };

  const handleUpdateCategory = async (id: string, newName: string) => {
    if (!newName.trim()) {
      Alert.alert('Validation Error', 'Category name cannot be empty.');
      return;
    }
  
    try {
      const response = await axios.patch(
        `${backend_Host}/category/edit`,
        { name: newName,
          categoryId:id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const updatedCategory = response.data.data;

  
      // // Update the local state
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id
            ? { ...category, name: updatedCategory.name, isEditing: false }
            : category
        )
      );
  
      Alert.alert('Success', 'Category updated successfully.');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      Alert.alert('Failed to update category. Please try again.');
    }
  };
  const handelDeleteCategory = async (id: string) => {
    try {
      const response = await axios.delete(`${backend_Host}/category/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
          categoryId: id, // Send the ID in the body
        },
      });
      Alert.alert('Success', 'Category deleted successfully.');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      Alert.alert('Failed to delete category. Please try again.');
    }
  };
  
  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        
        >
        <Navbar title="Task Categories" />
        <ScrollView
          className="h-full w-full flex-grow "
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-44">
            <View
              style={[
                styles.input,
                { height: 57, justifyContent: 'flex-start', alignItems: 'flex-start', width: "90%", marginBottom: 30, marginTop: 20 },
              ]}>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                ]}
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Search Category"
                placeholderTextColor="#787CA5"></TextInput>
            </View>

            <TouchableOpacity
              onPress={() => SetAiModalOpen(true)}
              className='w-[90%] border mb-8 border-[#37384B] py-5 px-7 rounded-3xl gap-4 flex flex-col'>
              <View className='w-full items-center justify-between flex flex-row'>
                <View className=' items-center flex flex-row gap-5'>
                  <Image className='h-7 w-7' source={require("../../assets/ZAi/Ai.png")} />
                  <Image className='h-[24px] w-[108px]' source={require("../../assets/ZAi/ZaplloAi.png")} />
                </View>
                <TouchableOpacity className=''>
                  <Image className='w-8 h-8' source={require("../../assets/Tasks/add.png")} />
                </TouchableOpacity>
              </View>
              <Text className='text-sm text-[#787CA5]' style={{ fontFamily: "LatoBold" }}>Use our intelligent AI engine to analyze your industry and carefully curate a selection of categories for your workflow.</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={AiModalOpen}
              onRequestClose={() => SetAiModalOpen(false)}
            >
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View className="mt-16 rounded-t-3xl bg-[#0A0D28] h-full p-5 pb-20">
                  <View className=" mb-7 flex w-full flex-row items-center justify-between">
                    <View className=' items-center flex flex-row gap-5'>
                      <Image className='h-7 w-7' source={require("../../assets/ZAi/Ai.png")} />
                      <Image className='h-[24px] w-[108px]' source={require("../../assets/ZAi/ZaplloAi.png")} />
                    </View>
                    <TouchableOpacity onPress={() => SetAiModalOpen(false)}>
                      <Image
                        source={require('../../assets/commonAssets/cross.png')}
                        className="h-8 w-8"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text className='text-[#787CA5] text-xs' style={{ fontFamily: "LatoBold" }}>Our intelligent AI engine has analyzed your industry and carefully curated a selection of categories. Choose the ones that suit your business, and let’s add them to your workflow effortlessly!
                  </Text>

                  <View className='mt-14 flex flex-col gap-6'>
                    {aiCategories?.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleAiSelection(index)}
                        className='w-full p-4 flex flex-row justify-between items-center rounded-2xl  border '
                        style={{
                          borderColor: AiSelectedItems.includes(index) ? '#815BF5' : '#37384B',
                        }}>

                        <View>
                          <Text className='text-xl text-white' style={{ fontFamily: "LatoBold" }}>{category}</Text>
                          {
                            AiSelectedItems.includes(index) ?
                              <Text className='text-xs text-[#37384B]' style={{ fontFamily: "LatoBold" }}>Tap to unselect</Text>
                              :
                              <Text className='text-xs text-[#37384B]' style={{ fontFamily: "LatoBold" }}>Tap to select
                              </Text>
                          }
                        </View>
                        {
                          AiSelectedItems.includes(index) &&
                          <Image className='w-8 h-8' source={require('../../assets/Tasks/isEditing.png')} />
                        }

                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={confirmAndSaveCategories}
                    className='w-full items-center p-3 mt-8 bg-[rgb(1,122,91)] rounded-full'>
                    <Text className='text-white text-lg font-bold ' style={{ fontFamily: "LatoBold" }}>Confirm & Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>

            <View className='w-[90%] mb-5 items-start'>
              <Text className='text-sm text-[#787CA5]'>Categories</Text>
            </View>
            {
  loading ? (
   
    <ActivityIndicator color={'#fff'} size={'large'} />
  ) : (
    filteredCategories?.length > 0 ? (
      filteredCategories
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category: any) => (
          <CategoryComponent
            key={category.id}
            id={category.id}
            title={category.name}
            onAddPress={(cat: string) => handleAddCategory(cat)}
            isEditing={category.isEditing}
            onEditToggle={() => toggleEditMode(category.id)}
            onUpdate={(newName: string) => handleUpdateCategory(category.id, newName)}
            onDeletePress={() => handelDeleteCategory(category.id)} 
          />
        ))
    ) : (
      <Text>No categories available</Text> 
    )
  )
}

            
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 85, width: '100%', alignItems: 'center' }}>

          <GradientButton
            title="Add New Category"
            onPress={addNewCategory}
            loading={isLoading}
            imageSource={require('../../assets/Tasks/addIcon.png')}
          />
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 30,
    padding: 8,
    paddingLeft:20,
  },
  inputSome: {
    color: 'white',
    fontFamily: 'Lato-Regular',
  },
});