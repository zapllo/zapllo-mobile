import React, { useState } from 'react';
import { View, Text, SafeAreaView, Platform, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput,KeyboardAvoidingView } from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import GradientButton from '~/components/GradientButton';
import CategoryComponent from '../../../../components/Dashboard/CategoryComponent';
import Navbar from '~/components/navbar';


export default function TaskCategories() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [taskDescription, setTaskDescription] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Automation', 'Customer Support']);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const addNewCategory = () => {
    setCategories([...categories, `New Category ${categories.length + 1}`]);
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

            <View className='w-[90%] border mb-8 border-[#37384B] py-5 px-7 rounded-3xl gap-4 flex flex-col' >
              <View className='w-full items-center justify-between flex flex-row'>
                <View className=' items-center flex flex-row gap-5'>
                  <Image className='h-7 w-7' source={require("../../../../assets/ZAi/Ai.png")}/>
                  <Image className='h-[24px] w-[108px]   ' source={require("../../../../assets/ZAi/ZaplloAi.png")}/>
                </View>
                <TouchableOpacity className=''>
                  <Image className='w-8 h-8' source={require("../../../../assets/Tasks/add.png")}/>
                </TouchableOpacity>
              </View>
              <Text className='text-sm text-[#787CA5]'>Use our intelligent AI engine to analyze your industry and carefully curate a selection of categories for your workflow.</Text>
            </View>
            

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
            imageSource={require('../../../../assets/Tasks/addIcon.png')}
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