import React, { useState } from 'react';
import { View, Text, SafeAreaView, Platform, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput,KeyboardAvoidingView } from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import GradientButton from '~/components/GradientButton';
import CategoryComponent from '../../components/Dashboard/CategoryComponent';
import Navbar from '~/components/navbar';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';


export default function TaskCategories() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [taskDescription, setTaskDescription] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Automation', 'Customer Support']);
  const [AiModalOpen,SetAiModalOpen] = useState(false);
  const [AiSelectedItems, setAiSelectedItems] = useState<number[]>([]);

  //fake ai data
  const aiCategories = ['Medical Staffing', 'Financial Analysis', 'Retail Management', 'Logistics Optimization', 'Healthcare Solutions'];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const addNewCategory = () => {
    setCategories([...categories, `New Category ${categories.length + 1}`]);
  };

  const toggleAiSelection = (index: number) => {
    setAiSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(index)
        ? prevSelectedItems.filter((item) => item !== index)
        : [...prevSelectedItems, index]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const confirmAndSaveCategories = () => {
    const selectedCategories = AiSelectedItems.map(index => aiCategories[index]);
    setCategories([...categories, ...selectedCategories]);
    SetAiModalOpen(false);
  };
  

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Navbar
          title="Task Categories"
          
        />
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-20">


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
                onChangeText={(value) => setTaskDescription(value)}
                placeholder="Search Category"
                placeholderTextColor="#787CA5"></TextInput>
            </View>


            {/* opeen a  modal when click those modal add as as a categories*/}
            <TouchableOpacity
            onPress={()=>SetAiModalOpen(true)}
            className='w-[90%] border mb-8 border-[#37384B] py-5 px-7 rounded-3xl gap-4 flex flex-col' >
              <View className='w-full items-center justify-between flex flex-row'>
                <View className=' items-center flex flex-row gap-5'>
                  <Image className='h-7 w-7' source={require("../../assets/ZAi/Ai.png")}/>
                  <Image className='h-[24px] w-[108px]   ' source={require("../../assets/ZAi/ZaplloAi.png")}/>
                </View>
                <TouchableOpacity className=''>
                  <Image className='w-8 h-8' source={require("../../assets/Tasks/add.png")}/>
                </TouchableOpacity>
              </View>
              <Text className='text-sm text-[#787CA5]' style={{fontFamily:"LatoBold"}}>Use our intelligent AI engine to analyze your industry and carefully curate a selection of categories for your workflow.</Text>
            </TouchableOpacity >
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

                  <Text className='text-[#787CA5] text-xs' style={{fontFamily:"LatoBold"}}>Our intelligent AI engine has analyzed your industry and carefully curated a selection of categories. Choose the ones that suit your business, and let’s add them to your workflow effortlessly!
                  </Text>

                  <View className='mt-14 flex flex-col gap-6'>
                  {aiCategories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleAiSelection(index)}
                        className='w-full p-4 flex flex-row justify-between items-center rounded-2xl  border '
                        style={{
                          borderColor: AiSelectedItems.includes(index) ? '#815BF5' : '#37384B',
                        }}>

                        <View>
                        <Text className='text-xl text-white'style={{fontFamily:"LatoBold"}}>{category}</Text>
                        {
                           AiSelectedItems.includes(index) ? 
                            <Text className='text-xs text-[#37384B]' style={{fontFamily:"LatoBold"}}>Tap to unselect</Text>
                            :
                            <Text className='text-xs text-[#37384B]'style={{fontFamily:"LatoBold"}}>Tap to select
                            </Text>           
                        }
                        </View>
                        {
                          AiSelectedItems.includes(index) &&
                          <Image className='w-8 h-8' source={require('../../assets/Tasks/isEditing.png')}/>
                        }
                        
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity 
                  onPress={confirmAndSaveCategories}
                  className='w-full items-center p-3 mt-8 bg-[rgb(1,122,91)] rounded-full'>
                    <Text className='text-white text-lg font-bold ' style={{fontFamily:"LatoBold"}}>Confirm & Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>





            <View className='w-[90%] mb-5 items-start'>
            <Text className='text-sm text-[#787CA5]'>Categories</Text>
            </View>

            {categories.map((category, index) => (
              <CategoryComponent
                key={index}
                title={category}
                onAddPress={toggleModal}
                onDeletePress={() => console.log('Delete pressed')}
              />
            ))}
          </View>
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 85, width: '100%', alignItems: 'center' }}>

          <GradientButton
            title="Add New Category"
            onPress={addNewCategory}
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