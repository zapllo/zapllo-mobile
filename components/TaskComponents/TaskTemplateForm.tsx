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
import FileModal from './assignNewTaskComponents/FileModal';
import AddLinkModal from './assignNewTaskComponents/AddLinkModal';
import ReminderModal from './assignNewTaskComponents/ReminderModal';
import WeeklyModal from './assignNewTaskComponents/WeeklyModal';
import MonthlyModal from './assignNewTaskComponents/MonthlyModal';
import InputContainer from '../InputContainer';
import CustomDropdownWithSearchAndAdd from '../customDropDownFour';
import CustomDropdown from '../customDropDown';
import ToastAlert, { ToastType } from '../ToastAlert';

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
  links?: string[];
  attachments?: any[];
  reminders?: Reminder[];
  audioUrl?: string;
  dates?: number[];
  repeatInterval?: number;
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
  onSuccess?: (message?: string) => void;
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
  const [isWeeklyModalVisible, setWeeklyModalVisible] = useState(false);
  const [isMonthlyModalVisible, setMonthlyModalVisible] = useState(false);
  const [isPeriodicallyModalVisible, setPeriodicallyModalVisible] = useState(false);
  
  // Temporary states for modals
  const [newCategory, setNewCategory] = useState('');
  
  // Toast states (only for validation and error messages within the modal)
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('error');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const isEditMode = !!existingTemplate?._id;

  // Helper function to show toast (only for errors and validation within modal)
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };

  // Initialize form with existing template data
  useEffect(() => {
    if (existingTemplate) {
      console.log('Loading existing template:', existingTemplate);
      
      setTitle(existingTemplate.title || '');
      setDescription(existingTemplate.description || '');
      setPriority((existingTemplate.priority as 'High' | 'Medium' | 'Low') || 'Low');
      setRepeat(existingTemplate.repeat || false);
      setRepeatType(existingTemplate.repeatType || '');
      setSelectedDays(existingTemplate.days || []);
      
      // Load additional template data
      if (existingTemplate.links && Array.isArray(existingTemplate.links)) {
        console.log('Loading template links:', existingTemplate.links);
        setLinks(existingTemplate.links);
      }
      
      if (existingTemplate.attachments && Array.isArray(existingTemplate.attachments)) {
        console.log('Loading template attachments:', existingTemplate.attachments);
        // Convert attachment URIs back to proper attachment objects
        const formattedAttachments = existingTemplate.attachments.map((att, index) => {
          if (typeof att === 'string') {
            // If it's just a URI string, create a proper attachment object
            return {
              uri: att,
              name: `Attachment ${index + 1}`,
              type: 'application/octet-stream'
            };
          }
          return att; // If it's already an object, use as is
        });
        setAttachments(formattedAttachments);
      }
      
      if (existingTemplate.reminders && Array.isArray(existingTemplate.reminders)) {
        console.log('Loading template reminders:', existingTemplate.reminders);
        setReminders(existingTemplate.reminders);
      }
      
      if (existingTemplate.audioUrl) {
        console.log('Loading template audioUrl:', existingTemplate.audioUrl);
        setAudioUrl(existingTemplate.audioUrl);
      }
      
      if (existingTemplate.dates && Array.isArray(existingTemplate.dates)) {
        setMonthlyDays(existingTemplate.dates);
      }
      
      if (existingTemplate.repeatInterval) {
        setRepeatInterval(existingTemplate.repeatInterval);
      }
      
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
      showToastMessage('error', 'Validation Error', 'Please enter a title for the template');
      return;
    }

    if (!description.trim()) {
      showToastMessage('error', 'Validation Error', 'Please enter a description for the template');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Prepare attachments data - ensure we save the URIs properly
      const attachmentData = attachments.map(att => {
        if (typeof att === 'string') {
          return att; // Already a URI string
        }
        return att.uri || att; // Extract URI from object
      });

      const templateData = {
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        priority,
        repeat,
        repeatType: repeat ? repeatType : undefined,
        repeatInterval: repeat && repeatType === 'Periodically' ? repeatInterval : undefined,
        days: repeat && repeatType === 'Weekly' ? selectedDays : [],
        dates: repeat && repeatType === 'Monthly' ? monthlyDays : [],
        attachments: attachmentData,
        links: links.filter(link => link.trim()),
        reminders,
        audioUrl: audioUrl || undefined,
      };

      console.log('Saving template data:', templateData);
      console.log('Links count:', links.length);
      console.log('Attachments count:', attachments.length);
      console.log('Reminders count:', reminders.length);
      console.log('AudioUrl:', audioUrl);

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
        console.log('Template saved successfully:', result);
        
        // Close modal immediately and pass success message to parent
        onClose();
        if (onSuccess) {
          onSuccess(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
        }
        if (!isEditMode) clearForm();
      } else {
        console.error('Error saving template:', result);
        showToastMessage(
          'error', 
          'Error', 
          result.error || `Failed to ${isEditMode ? 'update' : 'create'} template`
        );
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showToastMessage('error', 'Error', 'An error occurred while saving the template');
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

  const handleCreateCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      showToastMessage('error', 'Validation Error', 'Please enter a category name');
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
        showToastMessage('success', 'Success!', 'New category added successfully');
      } else {
        showToastMessage('error', 'Error', result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showToastMessage('error', 'Error', 'Failed to create category. Please try again.');
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

  // Repeat type options - same as AssignTaskScreen
  const selectRepetType = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'Periodically', value: 'Periodically' },
  ];

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
            backgroundColor: '#0A0D28',
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
              backgroundColor="#0A0D28"
            />
          </View>

          {/* Description */}
          <View className="w-full items-center">
            <View style={{
              borderWidth: 1,
              borderColor: '#37384B',
              padding: 10,
              marginTop: 25,
              width: '90%',
              minHeight: 120,
              position: 'relative',
              borderRadius: 15,
            }}>
              <Text style={{
                color: '#787CA5',
                position: 'absolute',
                top: -9,
                left: 25,
                backgroundColor: '#0A0D28',
                paddingRight: 5,
                paddingLeft: 5,
                fontSize: 13,
                fontWeight: '400',
                fontFamily: 'Nunito_400Regular'
              }}>
                Description *
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description..."
                placeholderTextColor="#787CA5"
                multiline
                numberOfLines={6}
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '500',
                  textAlignVertical: 'top',
                  minHeight: 100,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingHorizontal: 8,
                  lineHeight: 20,
                  fontFamily: 'Nunito_400Regular'
                }}
              />
            </View>
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
                backgroundColor: '#0A0D28',
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
              <View className="space-y-3 w-[110%]">
                {/* Repeat Type using CustomDropdown like AssignTaskScreen */}
                <CustomDropdown
                  data={selectRepetType}
                  placeholder="Select Repeat Type"
                  selectedValue={repeatType}
                  onSelect={(value) => {
                    setRepeatType(value);

                    if (value === 'Weekly') {
                      setWeeklyModalVisible(true);
                    } else if (value === 'Monthly') {
                      setMonthlyModalVisible(true);
                    } else if (value === 'Periodically') {
                      setPeriodicallyModalVisible(true);
                    }
                  }}
                />

                {/* Display selected days for Weekly */}
                {repeatType === 'Weekly' && selectedDays.length > 0 && (
                  <View>
                    <Text className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
                      Selected Days: {selectedDays.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Display selected dates for Monthly */}
                {repeatType === 'Monthly' && monthlyDays.length > 0 && (
                  <View>
                    <Text className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
                      Selected Dates: {monthlyDays.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Display interval for Periodically */}
                {repeatType === 'Periodically' && repeatInterval > 0 && (
                  <View>
                    <Text className="text-gray-300 text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
                      Repeat every {repeatInterval} day(s)
                    </Text>
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
              onPress={() => setShowLinksModal(true)}
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

        {/* Links Modal */}
        <AddLinkModal
          isLinkModalVisible={showLinksModal}
          setLinkModalVisible={setShowLinksModal}
          setLinks={setLinks}
          links={links}
        />

        {/* File Modal */}
        <FileModal
          isFileModalVisible={showAttachmentsModal}
          setFileModalVisible={setShowAttachmentsModal}
          attachments={attachments}
          setAttachments={setAttachments}
        />

        {/* Reminder Modal */}
        <ReminderModal
          isReminderModalVisible={showRemindersModal}
          setReminderModalVisible={setShowRemindersModal}
          setAddedReminders={setReminders}
        />

        {/* Audio Modal */}
        <AudioModal
          isAudioModalVisible={showAudioModal}
          setAudioModalVisible={setShowAudioModal}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
        />

        {/* Weekly Modal */}
        <WeeklyModal
          isVisible={isWeeklyModalVisible}
          onClose={() => setWeeklyModalVisible(false)}
          setWeekDays={setSelectedDays}
        />

        {/* Monthly Modal */}
        <MonthlyModal
          isVisible={isMonthlyModalVisible}
          onClose={() => setMonthlyModalVisible(false)}
          setMonthDays={setMonthlyDays}
        />

        {/* Periodically Modal */}
        <Modal
          isVisible={isPeriodicallyModalVisible}
          onBackdropPress={() => setPeriodicallyModalVisible(false)}
          style={{ margin: 20 }}
        >
          <View className="bg-[#0A0D28] rounded-2xl p-6">
            <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
              Set Periodic Interval
            </Text>
            <View className="w-full items-center">
              <InputContainer
                label="Repeat every (days)"
                value={repeatInterval.toString()}
                onChangeText={(text) => setRepeatInterval(parseInt(text) || 1)}
                placeholder=""
                passwordError=""
                keyboardType="numeric"
                backgroundColor="#0A0D28"
              />
            </View>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() => setPeriodicallyModalVisible(false)}
                className="bg-[#2A2D47] p-3 rounded-xl flex-1 mr-2"
              >
                <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (repeatInterval) {
                    setPeriodicallyModalVisible(false);
                  }
                }}
                className="bg-[#815BF5] p-3 rounded-xl flex-1 ml-2"
              >
                <Text className="text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Toast Alert - Only for validation errors and category creation within modal */}
        <ToastAlert
          visible={showToast}
          type={toastType}
          title={toastTitle}
          message={toastMessage}
          onHide={() => setShowToast(false)}
          position="top"
        />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}