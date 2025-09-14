import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NavbarTwo from '~/components/navbarTwo';
import GradientButton from '~/components/GradientButton';
import CategoryComponent from '../../components/Dashboard/CategoryComponent';
import InputContainer from '~/components/InputContainer';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import ToastAlert, { ToastType } from '~/components/ToastAlert';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';

const { width, height } = Dimensions.get('window');

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
  const [showFabLabel, setShowFabLabel] = useState(true);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [splashMessage, setSplashMessage] = useState({
    mainText: 'Success!',
    subtitle: 'Operation completed successfully'
  });
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Helper function to show toast
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const fabLabelAnim = useRef(new Animated.Value(0)).current;

  // Start animations immediately on component mount
  useEffect(() => {
    fetchCategories();
    handleSuggestCategories();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start FAB pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animate in the FAB label
    Animated.timing(fabLabelAnim, {
      toValue: 1,
      duration: 500,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Hide the FAB label after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fabLabelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowFabLabel(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const addNewCategory = () => {
    setAddModalOpen(true);
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      showToastMessage('error', 'Validation Error', 'Please enter a category name');
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
      showToastMessage('warning', 'No Selection', 'Please select at least one category.');
      return;
    }

    try {
      for (const category of selectedCategories) {
        await handleAddCategory(category);
      }
      
      fetchCategories();
      SetAiModalOpen(false);
      
      // Show success toast for AI categories
      showToastMessage(
        'success', 
        'Categories Added!', 
        `Successfully added ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'} from AI suggestions`
      );
      
      // Reset AI selections
      setAiSelectedItems([]);
    } catch (error) {
      showToastMessage('error', 'Error', 'Failed to add some categories. Please try again.');
    }
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
      showToastMessage('error', 'Error', 'Failed to fetch categories. Please try again.');
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
      showToastMessage('error', 'Validation Error', 'Enter new category');
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
      
      // Show success toast instead of splash screen
      showToastMessage('success', 'Success!', 'Category created successfully');
      
      // Add haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error creating category:', error);
      showToastMessage('error', 'Error', 'Failed to create category. Please try again.');
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
      showToastMessage('error', 'Error', 'Failed to suggest categories. Please try again.');
    }
  };

  const handleUpdateCategory = async (id: string, newName: string) => {
    if (!newName.trim()) {
      showToastMessage('error', 'Validation Error', 'Category name cannot be empty.');
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

      // Show success toast
      showToastMessage('success', 'Success!', 'Category updated successfully');
      
      // Add haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      showToastMessage('error', 'Error', 'Failed to update category. Please try again.');
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
      
      showToastMessage('success', 'Success!', 'Category deleted successfully');
      fetchCategories(); // Refresh the categories list
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      showToastMessage('error', 'Error', 'Failed to delete category. Please try again.');
    }
  };

  const filteredCategories = useMemo(() => {
    const search = taskDescription.toLowerCase();
    return categories.filter((category) => category.name.toLowerCase().includes(search));
  }, [taskDescription, categories]);

  const handleFabPress = () => {
    // Show the label again if it's hidden
    if (!showFabLabel) {
      setShowFabLabel(true);
      Animated.timing(fabLabelAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Hide it again after 3 seconds
      setTimeout(() => {
        Animated.timing(fabLabelAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowFabLabel(false));
      }, 3000);
    }
    
    setAddModalOpen(true);
  };

  const handleDonePress = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <CustomSplashScreen
        visible={showSplashScreen}
        lottieSource={require('../../assets/Animation/success.json')}
        mainText={splashMessage.mainText}
        subtitle={splashMessage.subtitle}
        duration={3000}
        onComplete={() => setShowSplashScreen(false)}
        onDismiss={() => setShowSplashScreen(false)}
      />

      <KeyboardAvoidingView
        className="w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo title="Task Categories" />

        <ScrollView
          className="h-full mt-6 w-full flex-grow "
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-44">
            <View className='flex items-center mb-8 flex-row gap-2'>
              <LinearGradient
                colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  width: '90%',
                }}
              >
                <Ionicons name="search" size={20} color="#787CA5" />
                <TextInput
                  placeholder="Search Category"
                  placeholderTextColor="#787CA5"
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '500',
                    fontFamily: 'LatoRegular'
                  }}
                />
                {taskDescription.length > 0 && (
                  <TouchableOpacity onPress={() => setTaskDescription("")}>
                    <Ionicons name="close-circle" size={20} color="#787CA5" />
                  </TouchableOpacity>
                )}
              </LinearGradient>
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
                    <TouchableOpacity onPress={() => SetAiModalOpen(true)}>
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
                          selection of categories. Choose the ones that suit your business, and let's
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
                          className="mt-8 w-full items-center rounded-full bg-[#37384B] p-3">
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
          <View style={styles.fabContainer}>
            {showFabLabel && (
              <Animated.View 
                style={[
                  styles.fabLabelContainer,
                  {
                    opacity: fabLabelAnim,
                    transform: [
                      { translateX: fabLabelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#ebdba5', '#d7ae48']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.fabLabel}
                >
                  <Text style={styles.fabLabelText}>Add Category</Text>
                </LinearGradient>
              </Animated.View>
            )}
            
            <Animated.View 
              style={{
                transform: [{ scale: fabAnim }]
              }}
            >
              <TouchableOpacity
                style={styles.fab}
                onPress={handleFabPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#017A5B', '#019E76']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.fabGradient}
                >
                  <Image
                    className="h-7 w-7"
                    source={require('../../assets/Tasks/addIcon.png')}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )
      }

      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalOpen}
        onRequestClose={() => setAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View className="-mb-1 gap-3 flex rounded-t-3xl bg-[#0A0D28] p-5 pb-10 pt-6" style={{ position: 'relative', minHeight: 250 }}>
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

              <View className="pb-4 flex justify-center items-center w-full">
                <InputContainer
                  placeholder=""
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  label="Enter category name"
                  className='w-full'
                  placeholderTextColor="#787CA5"
                  passwordError={''}
                  backgroundColor="#0A0D28"
                />
              </View>

              {!isKeyboardVisible ? (
                <TouchableOpacity
                  onPress={handleAddNewCategory}
                  disabled={isLoading}
                  className="w-full items-center rounded-xl bg-[#815bf5] p-2">
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-bold text-white" style={{ fontFamily: 'LatoBold' }}>
                      Add Category
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.doneButtonContainer}>
                  <TouchableOpacity
                    onPress={handleDonePress}
                    style={styles.doneButton}>
                    <Text className="text-base font-bold text-white" style={{ fontFamily: 'LatoBold' }}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Toast Alert */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowToast(false)}
        position="top"
      />

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
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fabLabelContainer: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabLabel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  fabLabelText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.3,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  doneButton: {
    backgroundColor: '#815bf5',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});