import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Switch,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Ionicons, 
  MaterialIcons, 
  AntDesign, 
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import AudioModal from './assignNewTaskComponents/AudioModal';
import InputContainer from '../InputContainer';
import CustomDropdownWithSearchAndAdd from '../customDropDownFour';

const { width, height } = Dimensions.get('window');

// Define interfaces
interface Template {
  _id?: string;
  title?: string;
  description?: string;
  category?: { _id: string; name: string } | string;
  priority?: string;
  repeat?: boolean;
  repeatType?: string;
  days?: string[];
  subcategory?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  email: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Reminder {
  notificationType: 'email' | 'whatsapp';
  type: 'minutes' | 'hours' | 'days';
  value: number;
}

interface TaskTemplateFormProps {
  isVisible: boolean;
  onClose: () => void;
  existingTemplate?: Template | null;
  onSuccess?: () => void;
}

export default function TaskTemplateForm({
  isVisible,
  onClose,
  existingTemplate,
  onSuccess
}: TaskTemplateFormProps) {
  // Basic form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Low');
  const [subcategory, setSubcategory] = useState('');
  
  // Repeat states
  const [repeat, setRepeat] = useState(false);
  const [repeatType, setRepeatType] = useState('');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [monthlyDays, setMonthlyDays] = useState<number[]>([]);
  
  // File and media states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  
  // Temporary states for modals
  const [tempLinks, setTempLinks] = useState<string[]>(['']);
  const [tempReminders, setTempReminders] = useState<Reminder[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const isEditMode = !!existingTemplate?._id;

  // Initialize form with existing template data
  useEffect(() => {
    if (existingTemplate) {
      setTitle(existingTemplate.title || '');
      setDescription(existingTemplate.description || '');
      setPriority((existingTemplate.priority as 'High' | 'Medium' | 'Low') || 'Low');
      setSubcategory(existingTemplate.subcategory || '');
      setRepeat(existingTemplate.repeat || false);
      setRepeatType(existingTemplate.repeatType || '');
      setSelectedDays(existingTemplate.days || []);
      
      if (typeof existingTemplate.category === 'string') {
        setCategory(existingTemplate.category);
      } else if (existingTemplate.category?._id) {
        setCategory(existingTemplate.category._id);
      }
    } else {
      // Clear form for new template
      clearForm();
    }
  }, [existingTemplate]);

  // Fetch categories and users
  useEffect(() => {
    if (isVisible) {
      fetchCategories();
      fetchUsers();
    }
  }, [isVisible]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://zapllo.com/api/category/get', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data || []);
        const formattedData = processCategoryData(result.data || []);
        setCategoryData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const processCategoryData = (data: Category[]) => {
    return data.map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://zapllo.com/api/users/organization', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('Low');
    setSubcategory('');
    setRepeat(false);
    setRepeatType('');
    setRepeatInterval(1);
    setSelectedDays([]);
    setMonthlyDays([]);
    setAttachments([]);
    setLinks([]);
    setReminders([]);
    setAudioUrl(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the template');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the template');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const templateData = {
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        priority,
        subcategory: subcategory || undefined,
        repeat,
        repeatType: repeat ? repeatType : undefined,
        repeatInterval: repeat && repeatType === 'Periodically' ? repeatInterval : undefined,
        days: repeat && repeatType === 'Weekly' ? selectedDays : [],
        dates: repeat && repeatType === 'Monthly' ? monthlyDays : [],
        attachments: attachments.map(att => att.uri),
        links: links.filter(link => link.trim()),
        reminders,
        audioUrl: audioUrl || undefined,
      };

      const url = isEditMode 
        ? `https://zapllo.com/api/taskTemplates/${existingTemplate._id}`
        : 'https://zapllo.com/api/taskTemplates';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success', 
          `Template ${isEditMode ? 'updated' : 'created'} successfully!`,
          [{ text: 'OK', onPress: () => {
            onClose();
            if (onSuccess) onSuccess();
            if (!isEditMode) clearForm();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || `Failed to ${isEditMode ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      Alert.alert('Error', 'An error occurred while saving the template');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setAttachments([...attachments, ...result.assets]);
        setShowAttachmentsModal(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    const validLinks = tempLinks.filter(link => link.trim());
    setLinks([...links, ...validLinks]);
    setTempLinks(['']);
    setShowLinksModal(false);
  };

  const handleAddReminder = (reminder: Reminder) => {
    const isDuplicate = tempReminders.some(r => 
      r.notificationType === reminder.notificationType &&
      r.type === reminder.type &&
      r.value === reminder.value
    );

    if (isDuplicate) {
      Alert.alert('Error', 'Duplicate reminders are not allowed');
      return;
    }

    setTempReminders([...tempReminders, reminder]);
  };

  const handleSaveReminders = () => {
    setReminders(tempReminders);
    setShowRemindersModal(false);
  };

  const handleCreateCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Enter new category');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://zapllo.com/api/category/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh categories
        fetchCategories();
        setCategory(result.data._id);
        Alert.alert('Success', 'New Category Added');
      } else {
        Alert.alert('Error', result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat ? cat.name : 'Select Category';
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const priorityColors = {
    High: '#FF4757',
    Medium: '#FFA726',
    Low: '#66BB6A'
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.8}
      avoidKeyboard={false}
      propagateSwipe={true}
      
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ 
            maxHeight: height * 0.95,
            minHeight: height * 0.8,
            backgroundColor: '#05071E',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-[#2A2D47]">
          <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
            {isEditMode ? 'Edit Template' : 'Create Template'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 " 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Title */}
          <View className="w-full items-center">
            <InputContainer
              label="Title *"
              value={title}
              onChangeText={setTitle}
              placeholder=""
              passwordError=""
            />
          </View>

          {/* Description */}
          <View className="w-full items-center">
            <InputContainer
              label="Description *"
              value={description}
              onChangeText={setDescription}
              placeholder=""
              passwordError=""
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: 'top', height: 80 }}
            />
          </View>

          {/* Category */}
          <View className="w-full items-center">
            <View style={{
              borderWidth: 1,
              borderColor: '#37384B',
              padding: 10,
              marginTop: 25,
              width: '90%',
              height: 57,
              position: 'relative',
              borderRadius: 15,
            }}>
              <Text style={{
                color: '#787CA5',
                position: 'absolute',
                top: -9,
                left: 25,
                backgroundColor: '#05071E',
                paddingRight: 5,
                paddingLeft: 5,
                fontSize: 13,
                fontWeight: '400',
                fontFamily: 'Nunito_400Regular'
              }}>
                Select Category
              </Text>
              <CustomDropdownWithSearchAndAdd
                data={categoryData}
                selectedValue={category}
                onSelect={(value) => setCategory(value)}
                placeholder="Select category"
                onCreateCategory={handleCreateCategory}
                setCategoryData={setCategoryData}
                isLoading={isLoading}
              />
            </View>
          </View>

          {/* Subcategory */}
          <View className="w-full items-center ">
            <InputContainer
              label="Subcategory"
              value={subcategory}
              onChangeText={setSubcategory}
              placeholder=""
              passwordError=""
            />
          </View>
        
          <View className='w-full p-6'>
          {/* Priority */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
              Priority
            </Text>
            <View className="flex-row gap-3">
              {(['High', 'Medium', 'Low'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => {
                    setPriority(level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`flex-1 p-3 rounded-xl border ${
                    priority === level ? 'border-[#815BF5]' : 'border-[#2A2D47]'
                  }`}
                  style={{
                    backgroundColor: priority === level 
                      ? `${priorityColors[level]}20` 
                      : '#2A2D47'
                  }}
                >
                  <Text 
                    className="text-center text-sm"
                    style={{ 
                      fontFamily: 'LatoBold',
                      color: priority === level ? priorityColors[level] : '#FFFFFF'
                    }}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Repeat */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-300 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Repeat
              </Text>
              <Switch
                value={repeat}
                onValueChange={setRepeat}
                trackColor={{ false: '#2A2D47', true: '#815BF5' }}
                thumbColor={repeat ? '#FFFFFF' : '#676B93'}
              />
            </View>

            {repeat && (
              <View className="space-y-3">
                {/* Repeat Type */}
                <TouchableOpacity
                  onPress={() => setShowRepeatModal(true)}
                  className="bg-[#2A2D47] p-4 rounded-xl flex-row items-center justify-between"
                >
                  <Text className="text-white" style={{ fontFamily: 'LatoRegular' }}>
                    {repeatType || 'Select Repeat Type'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#676B93" />
                </TouchableOpacity>

                {/* Weekly Days Selection */}
                {repeatType === 'Weekly' && (
                  <View>
                    <Text className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
                      Select Days
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {weekDays.map((day) => (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleDayToggle(day)}
                          className={`px-3 py-2 rounded-full ${
                            selectedDays.includes(day) 
                              ? 'bg-[#815BF5]' 
                              : 'bg-[#2A2D47] border border-[#676B93]'
                          }`}
                        >
                          <Text 
                            className={`text-xs ${
                              selectedDays.includes(day) ? 'text-white' : 'text-gray-400'
                            }`}
                            style={{ fontFamily: 'LatoRegular' }}
                          >
                            {day.slice(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Periodically Interval */}
                {repeatType === 'Periodically' && (
                  <View className="w-full items-center">
                    <InputContainer
                      label="Repeat every (days)"
                      value={repeatInterval.toString()}
                      onChangeText={(text) => setRepeatInterval(parseInt(text) || 1)}
                      placeholder=""
                      passwordError=""
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-around mb-6">
            {/* Links */}
            <TouchableOpacity
              onPress={() => setShowLinksModal(true)}
              className={`items-center p-3 rounded-xl ${
                links.length > 0 ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
              }`}
            >
              <MaterialIcons name="link" size={24} color="#FFFFFF" />
              <Text className="text-white text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                Links {links.length > 0 && `(${links.length})`}
              </Text>
            </TouchableOpacity>

            {/* Attachments */}
            <TouchableOpacity
              onPress={() => setShowAttachmentsModal(true)}
              className={`items-center p-3 rounded-xl ${
                attachments.length > 0 ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
              }`}
            >
              <MaterialIcons name="attach-file" size={24} color="#FFFFFF" />
              <Text className="text-white text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                Files {attachments.length > 0 && `(${attachments.length})`}
              </Text>
            </TouchableOpacity>

            {/* Reminders */}
            <TouchableOpacity
              onPress={() => setShowRemindersModal(true)}
              className={`items-center p-3 rounded-xl ${
                reminders.length > 0 ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
              }`}
            >
              <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
              <Text className="text-white text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                Reminders {reminders.length > 0 && `(${reminders.length})`}
              </Text>
            </TouchableOpacity>

            {/* Audio Recording */}
            <TouchableOpacity
              onPress={() => setShowAudioModal(true)}
              className={`items-center p-3 rounded-xl ${
                audioUrl ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
              }`}
            >
              <MaterialIcons 
                name="mic" 
                size={24} 
                color="#FFFFFF" 
              />
              <Text className="text-white text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                {audioUrl ? 'Recorded' : 'Record'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-[#815BF5] p-4 rounded-xl flex-row items-center justify-center mb-6"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#FFFFFF" />
                <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                  {isEditMode ? 'Update Template' : 'Create Template'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          </View>

        </ScrollView>

        
        {/* Repeat Type Modal */}
        <Modal
          isVisible={showRepeatModal}
          onBackdropPress={() => setShowRepeatModal(false)}
          style={{ margin: 20 }}
        >
          <View className="bg-[#1A1D36] rounded-2xl p-6">
            <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
              Select Repeat Type
            </Text>
            
            {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Periodically'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setRepeatType(type);
                  setShowRepeatModal(false);
                }}
                className={`p-4 rounded-xl mb-2 ${
                  repeatType === type ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
                }`}
              >
                <Text className="text-white" style={{ fontFamily: 'LatoRegular' }}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowRepeatModal(false)}
              className="bg-[#2A2D47] p-3 rounded-xl mt-4"
            >
              <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Links Modal */}
        <Modal
          isVisible={showLinksModal}
          onBackdropPress={() => setShowLinksModal(false)}
          style={{ margin: 20 }}
        >
          <View className="bg-[#1A1D36] rounded-2xl p-6 max-h-[70%]">
            <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
              Add Links
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {tempLinks.map((link, index) => (
                <View key={index} className="flex-row items-center mb-3">
                  <TextInput
                    value={link}
                    onChangeText={(text) => {
                      const newLinks = [...tempLinks];
                      newLinks[index] = text;
                      setTempLinks(newLinks);
                    }}
                    placeholder="Enter URL"
                    placeholderTextColor="#676B93"
                    className="flex-1 bg-[#2A2D47] text-white p-3 rounded-xl mr-2"
                    style={{ fontFamily: 'LatoRegular' }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (tempLinks.length > 1) {
                        setTempLinks(tempLinks.filter((_, i) => i !== index));
                      }
                    }}
                    className="bg-[#FF4757] p-3 rounded-xl"
                  >
                    <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setTempLinks([...tempLinks, ''])}
                className="flex-1 bg-[#2A2D47] p-3 rounded-xl"
              >
                <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                  Add More
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddLink}
                className="flex-1 bg-[#815BF5] p-3 rounded-xl"
              >
                <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                  Save Links
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Attachments Modal */}
        <Modal
          isVisible={showAttachmentsModal}
          onBackdropPress={() => setShowAttachmentsModal(false)}
          style={{ margin: 20 }}
        >
          <View className="bg-[#1A1D36] rounded-2xl p-6 max-h-[70%]">
            <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
              Attachments
            </Text>
            
            <TouchableOpacity
              onPress={handlePickDocument}
              className="bg-[#815BF5] p-4 rounded-xl flex-row items-center justify-center mb-4"
            >
              <MaterialIcons name="attach-file" size={20} color="#FFFFFF" />
              <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                Pick Documents
              </Text>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {attachments.map((attachment, index) => (
                <View key={index} className="flex-row items-center justify-between bg-[#2A2D47] p-3 rounded-xl mb-2">
                  <Text className="text-white flex-1" style={{ fontFamily: 'LatoRegular' }}>
                    {attachment.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeAttachment(index)}
                    className="ml-2"
                  >
                    <MaterialIcons name="delete" size={20} color="#FF4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAttachmentsModal(false)}
              className="bg-[#2A2D47] p-3 rounded-xl mt-4"
            >
              <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Reminders Modal */}
        <Modal
          isVisible={showRemindersModal}
          onBackdropPress={() => setShowRemindersModal(false)}
          style={{ margin: 20 }}
        >
          <ReminderModal
            tempReminders={tempReminders}
            setTempReminders={setTempReminders}
            onSave={handleSaveReminders}
            onClose={() => setShowRemindersModal(false)}
          />
        </Modal>

        {/* Audio Modal */}
        <AudioModal
          isAudioModalVisible={showAudioModal}
          setAudioModalVisible={setShowAudioModal}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
        />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Reminder Modal Component
interface ReminderModalProps {
  tempReminders: Reminder[];
  setTempReminders: (reminders: Reminder[]) => void;
  onSave: () => void;
  onClose: () => void;
}

function ReminderModal({ tempReminders, setTempReminders, onSave, onClose }: ReminderModalProps) {
  const [reminderType, setReminderType] = useState<'email' | 'whatsapp'>('email');
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [value, setValue] = useState('');

  const addReminder = () => {
    const numValue = parseInt(value);
    if (!numValue || numValue <= 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const newReminder: Reminder = {
      notificationType: reminderType,
      type: timeUnit,
      value: numValue
    };

    const isDuplicate = tempReminders.some(r => 
      r.notificationType === newReminder.notificationType &&
      r.type === newReminder.type &&
      r.value === newReminder.value
    );

    if (isDuplicate) {
      Alert.alert('Error', 'Duplicate reminders are not allowed');
      return;
    }

    setTempReminders([...tempReminders, newReminder]);
    setValue('');
  };

  const removeReminder = (index: number) => {
    setTempReminders(tempReminders.filter((_, i) => i !== index));
  };

  return (
    <View className="bg-[#1A1D36] rounded-2xl p-6 max-h-[70%]">
      <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
        Add Reminders
      </Text>
      
      {/* Add Reminder Form */}
      <View className="mb-4">
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1">
            <Text className="text-gray-300 text-xs mb-1" style={{ fontFamily: 'LatoRegular' }}>
              Type
            </Text>
            <TouchableOpacity
              onPress={() => setReminderType(reminderType === 'email' ? 'whatsapp' : 'email')}
              className="bg-[#2A2D47] p-3 rounded-xl"
            >
              <Text className="text-white text-center" style={{ fontFamily: 'LatoRegular' }}>
                {reminderType === 'email' ? 'Email' : 'WhatsApp'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="w-20">
            <Text className="text-gray-300 text-xs mb-1" style={{ fontFamily: 'LatoRegular' }}>
              Value
            </Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="0"
              placeholderTextColor="#676B93"
              keyboardType="numeric"
              className="bg-[#2A2D47] text-white p-3 rounded-xl text-center"
              style={{ fontFamily: 'LatoRegular' }}
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-300 text-xs mb-1" style={{ fontFamily: 'LatoRegular' }}>
              Unit
            </Text>
            <TouchableOpacity
              onPress={() => {
                const units: ('minutes' | 'hours' | 'days')[] = ['minutes', 'hours', 'days'];
                const currentIndex = units.indexOf(timeUnit);
                const nextIndex = (currentIndex + 1) % units.length;
                setTimeUnit(units[nextIndex]);
              }}
              className="bg-[#2A2D47] p-3 rounded-xl"
            >
              <Text className="text-white text-center" style={{ fontFamily: 'LatoRegular' }}>
                {timeUnit}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={addReminder}
            className="bg-[#815BF5] p-3 rounded-xl justify-center"
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminders List */}
      <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
        {tempReminders.map((reminder, index) => (
          <View key={index} className="flex-row items-center justify-between bg-[#2A2D47] p-3 rounded-xl mb-2">
            <Text className="text-white" style={{ fontFamily: 'LatoRegular' }}>
              {reminder.notificationType} - {reminder.value} {reminder.type}
            </Text>
            <TouchableOpacity onPress={() => removeReminder(index)}>
              <MaterialIcons name="delete" size={20} color="#FF4757" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 bg-[#2A2D47] p-3 rounded-xl"
        >
          <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={onSave}
          className="flex-1 bg-[#815BF5] p-3 rounded-xl"
        >
          <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
            Save Reminders
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}