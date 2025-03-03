import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import Navbar from '~/components/navbar';
import GradientButton from '~/components/GradientButton';
import CategoryComponent from '../../components/Dashboard/CategoryComponent';
import InputContainer from '~/components/InputContainer';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';

export default function TaskCategories() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; isEditing: boolean }[]>([]);
  const [AiModalOpen, SetAiModalOpen] = useState(false);
  const [AiSelectedItems, setAiSelectedItems] = useState<number[]>([]);
  const [aiCategories, setAiCategories] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchCategories();
    handleSuggestCategories();
  }, [token]);

  const addNewCategory = () => {
    setAddModalOpen(true);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }

    await handleAddCategory(newCategoryName);
    setNewCategoryName('');
    setAddModalOpen(false);
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
      fetchCategories();
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

  const handleAddCategory = async (cat: string) => {
    if (!cat) {
      Alert.alert('Validation Error', 'Enter new category');
      return;
    }
    setIsLoading(true);
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

      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestCategories = async () => {
    try {
      const response = await axios.post(
        `${backend_Host}/category/suggest`,
        {
          industry: 'Technology',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const suggestCategoryy = response?.data?.categories;
      setAiCategories(suggestCategoryy);
    } catch (error) {
      console.error('Error suggesting categories:', error);
      Alert.alert('Failed to suggest category. Please try again.');
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
        { name: newName, categoryId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedCategory = response.data.data;

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
          categoryId: id,
        },
      });
      Alert.alert('Success', 'Category deleted successfully.');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      Alert.alert('Failed to delete category. Please try again.');
    }
  };

  const filteredCategories = useMemo(() => {
    const search = taskDescription.toLowerCase();
    return categories.filter((category) => category.name.toLowerCase().includes(search));
  }, [taskDescription, categories]);

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">

      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Navbar title="Task Categories" />

        <ScrollView
          className="h-full mt-6 w-full flex-grow "
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-44">
            <View className='flex items-center mb-12 flex-row gap-2'>
              <View className='relative'>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="  top-0 left-1  h-10 w-10 ">
                  <Image
                    // resizeMode="contain"
                    className="h-10 w-10"
                    source={require('../../assets/sign-in/back.png')}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.input,
                  {
                    height:50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 2,
                    width: '80%',
          

                  },
                ]}>
                <TextInput
                  
                  style={[
                    styles.inputSome,
                    { textAlignVertical: 'top', width: '100%' },
                  ]}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  placeholder="Search Category"
                  placeholderTextColor="#787CA5"></TextInput>
              </View>
            </View>
            {(userData?.data?.role === 'orgAdmin' || userData?.user?.role === 'orgAdmin') && (
              <>
                <TouchableOpacity
                  onPress={() => SetAiModalOpen(true)}
                  className="mb-8 flex w-[90%] flex-col gap-4 rounded-3xl border border-[#37384B] px-7 py-5">
                  <View className="flex w-full flex-row items-center justify-between">
                    <View className=" flex flex-row items-center gap-5">
                      <Image className="h-7 w-7" source={require('../../assets/ZAi/Ai.png')} />
                      <Image
                        className="h-[24px] w-[108px]"
                        source={require('../../assets/ZAi/ZaplloAi.png')}
                      />
                    </View>
                    <TouchableOpacity className="">
                      <Image className="h-8 w-8" source={require('../../assets/Tasks/add.png')} />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                    Use our intelligent AI engine to analyze your industry and carefully curate a
                    selection of categories for your workflow.
                  </Text>
                </TouchableOpacity>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={AiModalOpen}
                  onRequestClose={() => SetAiModalOpen(false)}>
                  <View style={styles.modalOverlay}>
                    <ScrollView
                      contentContainerStyle={{ flexGrow: 1 }}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled">
                      <View className="mt-16 h-full rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
                        <View className=" mb-7 flex w-full flex-row items-center justify-between">
                          <View className=" flex flex-row items-center gap-5">
                            <Image className="h-7 w-7" source={require('../../assets/ZAi/Ai.png')} />
                            <Image
                              className="h-[24px] w-[108px]"
                              source={require('../../assets/ZAi/ZaplloAi.png')}
                            />
                          </View>
                          <TouchableOpacity onPress={() => SetAiModalOpen(false)}>
                            <Image
                              source={require('../../assets/commonAssets/cross.png')}
                              className="h-8 w-8"
                            />
                          </TouchableOpacity>
                        </View>

                        <Text className="text-xs text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                          Our intelligent AI engine has analyzed your industry and carefully curated a
                          selection of categories. Choose the ones that suit your business, and let’s
                          add them to your workflow effortlessly!
                        </Text>

                        <View className="mt-14 flex flex-col gap-6">
                          {aiCategories?.map((category, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => toggleAiSelection(index)}
                              className="flex w-full flex-row items-center justify-between rounded-2xl border  p-4 "
                              style={{
                                borderColor: AiSelectedItems.includes(index) ? '#815BF5' : '#37384B',
                              }}>
                              <View>
                                <Text
                                  className="text-xl text-white"
                                  style={{ fontFamily: 'LatoBold' }}>
                                  {category}
                                </Text>
                                {AiSelectedItems.includes(index) ? (
                                  <Text
                                    className="text-xs text-[#37384B]"
                                    style={{ fontFamily: 'LatoBold' }}>
                                    Tap to unselect
                                  </Text>
                                ) : (
                                  <Text
                                    className="text-xs text-[#37384B]"
                                    style={{ fontFamily: 'LatoBold' }}>
                                    Tap to select
                                  </Text>
                                )}
                              </View>
                              {AiSelectedItems.includes(index) && (
                                <Image
                                  className="h-8 w-8"
                                  source={require('../../assets/Tasks/isEditing.png')}
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity
                          onPress={confirmAndSaveCategories}
                          className="mt-8 w-full items-center rounded-full bg-[rgb(1,122,91)] p-3">
                          <Text
                            className="text-lg font-bold text-white "
                            style={{ fontFamily: 'LatoBold' }}>
                            Confirm & Save
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
              </>
            )}

            <View className="mb-5 w-[90%] items-start">
              <Text className="text-sm text-[#787CA5]">Categories</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={'#fff'} size={'large'} />
            ) : filteredCategories?.length > 0 ? (
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
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {
        (userData?.data?.role === 'orgAdmin' || userData?.user?.role === 'orgAdmin') && (
          <View style={{ position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' }}>
            <GradientButton
              title="Add New Category"
              onPress={addNewCategory}
              loading={isLoading}
              imageSource={require('../../assets/Tasks/addIcon.png')}
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={addModalOpen}
              onRequestClose={() => setAddModalOpen(false)}>
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <View className="-mb-1 gap-3 flex rounded-t-3xl bg-[#0A0D28] p-5 pb-10 pt-6">
                    <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
                      <Text className="text-xl text-white" style={{ fontFamily: 'LatoBold' }}>
                        Add New Category
                      </Text>
                      <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                        <Image
                          source={require('../../assets/commonAssets/cross.png')}
                          className="h-8 w-8"
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="pb-4 flex justify-center w-full">
                      <InputContainer
                        placeholder=""
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        label="Enter category name"
                        className='w-full'
                        placeholderTextColor="#787CA5"
                        passwordError={''}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleAddNewCategory}
                      disabled={isLoading}
                      className="w-full items-center rounded-full bg-[#815bf5] p-3">
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-lg font-bold text-white" style={{ fontFamily: 'LatoBold' }}>
                          Add Category
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </Modal>
          </View>
        )
      }

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 15,
  },
  inputSome: {
    color: '#fff',
    fontFamily: 'LatoBold',
    paddingLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black tinted background
    justifyContent: 'flex-end',
  },
});