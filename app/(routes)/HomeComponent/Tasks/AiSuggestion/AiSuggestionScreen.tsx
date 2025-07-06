import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import axios from 'axios';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import CustomAlert from '~/components/CustomAlert/CustomAlert';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import { router } from 'expo-router';

interface AiSuggestionScreenProps {
  isVisible?: boolean;
  onClose?: () => void;
}

interface TaskData {
  title: string;
  description: string;
  priority: string;
  category: {
    _id: string;
    name: string;
  } | null;
  assignedUser: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  dueDate: string;
  dueTime: string;
}

interface CreditStatus {
  remaining: number;
  used: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function AiSuggestionScreen({ isVisible = true, onClose }: AiSuggestionScreenProps) {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const textInputRef = useRef<TextInput>(null);
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<'success' | 'error' | 'loading'>('success');
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // @mention functionality
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Fetch users for @mention functionality
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/organization`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Handle @mention detection and filtering
  useEffect(() => {
    const lastAtIndex = prompt.lastIndexOf('@', cursorPosition);
    const lastSpaceIndex = prompt.lastIndexOf(' ', cursorPosition);
    
    if (lastAtIndex > lastSpaceIndex && lastAtIndex !== -1) {
      const query = prompt.substring(lastAtIndex + 1, cursorPosition);
      setMentionQuery(query);
      setShowMentionSuggestions(true);
      
      // Filter users based on query
      const filtered = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
      setFilteredUsers([]);
    }
  }, [prompt, cursorPosition, users]);

  const handleClose = () => {
    setPrompt('');
    setTaskData(null);
    setCreditStatus(null);
    setSelectedUserId(null);
    setShowMentionSuggestions(false);
    Keyboard.dismiss();
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  const handleTextChange = (text: string) => {
    setPrompt(text);
  };

  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const handleMentionSelect = (user: User) => {
    const lastAtIndex = prompt.lastIndexOf('@', cursorPosition);
    const beforeMention = prompt.substring(0, lastAtIndex);
    const afterMention = prompt.substring(cursorPosition);
    const mentionText = `@${user.firstName} ${user.lastName} `;
    
    const newText = beforeMention + mentionText + afterMention;
    setPrompt(newText);
    setShowMentionSuggestions(false);
    setSelectedUserId(user._id);
    
    // Focus back to input
    setTimeout(() => {
      textInputRef.current?.focus();
      const newCursorPosition = beforeMention.length + mentionText.length;
      textInputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition }
      });
    }, 100);
  };

  const handleAiSuggestion = async () => {
    if (!prompt.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Please enter a task description');
      setCustomAlertType('error');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await axios.post(
        `${backend_Host}/ai-suggestion`, // Fixed endpoint - removed /tasks prefix
        {
          prompt: prompt.trim(),
          assignedUserId: selectedUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setTaskData(response.data.taskData);
        setCreditStatus(response.data.creditStatus);
        setCustomAlertVisible(true);
        setCustomAlertMessage('AI suggestion generated successfully!');
        setCustomAlertType('success');
      } else {
        setCustomAlertVisible(true);
        setCustomAlertMessage(response.data.error || 'Failed to generate AI suggestion');
        setCustomAlertType('error');
      }
    } catch (error: any) {
      console.error('Error generating AI suggestion:', error);
      let errorMessage = 'Failed to generate AI suggestion. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'AI suggestion service is not available. Please contact support.';
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.error || 'No AI credits remaining.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setCustomAlertVisible(true);
      setCustomAlertMessage(errorMessage);
      setCustomAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskData) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        repeat: false,
        repeatType: '',
        days: [],
        dates: [],
        dueDate: new Date(taskData.dueDate),
        completionDate: '',
        category: taskData.category?._id || '',
        assignedUser: taskData.assignedUser?.id || '',
        status: 'Pending',
        organization: userData?.data?.organization || userData?.user?.organization,
        attachment: [],
        audioUrl: null,
        links: [],
        comments: [],
        reminders: [],
      };

      const response = await axios.post(`${backend_Host}/tasks/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setShowSplashScreen(true);
      
      // Auto-close splash screen and navigate back after 3 seconds
      setTimeout(() => {
        setShowSplashScreen(false);
        handleClose();
      }, 3000);

    } catch (error: any) {
      console.error('Error creating task:', error);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to create task. Please try again.');
      setCustomAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = () => {
    if (!taskData) return;
    
    // Navigate to assign task screen with pre-filled data
    router.push({
      pathname: '/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen',
      params: {
        aiSuggestion: JSON.stringify(taskData)
      }
    });
    handleClose();
  };

  const renderUserMentions = () => {
    return users.map((user: User) => (
      <TouchableOpacity
        key={user._id}
        style={[
          styles.userMentionItem,
          selectedUserId === user._id && styles.selectedUserMention
        ]}
        onPress={() => {
          setSelectedUserId(selectedUserId === user._id ? null : user._id);
          Haptics.selectionAsync();
        }}
      >
        <View style={styles.userMentionContent}>
          {user.profilePic ? (
            <Image source={{ uri: user.profilePic }} style={styles.userAvatar} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarText}>
                {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userMentionText}>
            {user.firstName} {user.lastName || ''}
          </Text>
        </View>
        {selectedUserId === user._id && (
          <MaterialIcons name="check-circle" size={20} color="#815BF5" />
        )}
      </TouchableOpacity>
    ));
  };

  const renderMentionSuggestions = () => {
    if (!showMentionSuggestions || filteredUsers.length === 0) return null;

    return (
      <View style={styles.mentionSuggestionsContainer}>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mentionSuggestionItem}
              onPress={() => handleMentionSelect(item)}
            >
              {item.profilePic ? (
                <Image source={{ uri: item.profilePic }} style={styles.mentionAvatar} />
              ) : (
                <View style={styles.mentionAvatarPlaceholder}>
                  <Text style={styles.mentionAvatarText}>
                    {item.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <Text style={styles.mentionSuggestionText}>
                {item.firstName} {item.lastName || ''}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.mentionSuggestionsList}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  };

  const renderTaskPreview = () => {
    if (!taskData) return null;

    return (
      <View style={styles.taskPreviewContainer}>
        <Text style={styles.taskPreviewTitle}>AI Generated Task</Text>
        
        <View style={styles.taskPreviewCard}>
          <View style={styles.taskPreviewHeader}>
            <Text style={styles.taskTitle}>{taskData.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(taskData.priority) }]}>
              <Text style={styles.priorityText}>{taskData.priority}</Text>
            </View>
          </View>
          
          <Text style={styles.taskDescription}>{taskData.description}</Text>
          
          <View style={styles.taskDetails}>
            {taskData.category && (
              <View style={styles.detailItem}>
                <MaterialIcons name="category" size={16} color="#787CA5" />
                <Text style={styles.detailText}>{taskData.category.name}</Text>
              </View>
            )}
            
            {taskData.assignedUser && (
              <View style={styles.detailItem}>
                <MaterialIcons name="person" size={16} color="#787CA5" />
                <Text style={styles.detailText}>
                  {taskData.assignedUser.firstName} {taskData.assignedUser.lastName}
                </Text>
              </View>
            )}
            
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color="#787CA5" />
              <Text style={styles.detailText}>
                {new Date(taskData.dueDate).toLocaleDateString()} at {taskData.dueTime}
              </Text>
            </View>
          </View>
          
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditTask}
              disabled={isLoading}
            >
              <MaterialIcons name="edit" size={20} color="#815BF5" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTask}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#815BF5', '#FC8929']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.createButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="add-task" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create Task</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {creditStatus && (
          <View style={styles.creditStatus}>
            <MaterialIcons name="stars" size={16} color="#FC8929" />
            <Text style={styles.creditText}>
              AI Credits: {creditStatus.remaining} remaining
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#FF4757';
      case 'medium': return '#FFA726';
      case 'low': return '#66BB6A';
      default: return '#787CA5';
    }
  };

  const ModalContent = () => (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Task Assistant</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={styles.content}>
            {/* AI Icon and Description */}
            <View style={styles.aiIntro}>
              <LinearGradient
                colors={['#815BF5', '#4929fc']}
                style={styles.aiIcon}
              >
                <MaterialIcons name="auto-awesome" size={32} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.aiIntroTitle}>Describe your task</Text>
              <Text style={styles.aiIntroSubtitle}>
                Tell me what you need to do and I'll help you create a structured task. Use @ to mention users.
              </Text>
            </View>

            {/* User Selection */}
            {users.length > 0 && (
              <View style={styles.userSelectionContainer}>
                <Text style={styles.sectionTitle}>Assign to (optional)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.userMentionScroll}
                >
                  {renderUserMentions()}
                </ScrollView>
              </View>
            )}

            {/* Prompt Input */}
            <View style={styles.promptContainer}>
              <Text style={styles.sectionTitle}>Task Description</Text>
              <View style={styles.promptInputContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.promptInput}
                  value={prompt}
                  onChangeText={handleTextChange}
                  onSelectionChange={handleSelectionChange}
                  placeholder="e.g., 'Create a marketing presentation for next Friday at 3 PM and assign it to @John'"
                  placeholderTextColor="#787CA5"
                  multiline
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  returnKeyType="default"
                />
                {renderMentionSuggestions()}
              </View>
              
              <TouchableOpacity
                style={[styles.generateButton, (!prompt.trim() || isLoading) && styles.generateButtonDisabled]}
                onPress={handleAiSuggestion}
                disabled={isLoading || !prompt.trim()}
              >
                <LinearGradient
                  colors={(!prompt.trim() || isLoading) ? ['#37384B', '#37384B'] : ['#4929fc', '#815BF5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.generateButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
                      <Text style={styles.generateButtonText}>Generate Task</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Task Preview */}
            {renderTaskPreview()}

            {/* Example Prompts */}
            <View style={styles.examplesContainer}>
              <Text style={styles.sectionTitle}>Example prompts</Text>
              {[
                "Schedule a team meeting for tomorrow at 2 PM",
                "Create a high priority bug fix task for next Monday",
                "Assign a content review task to @Sarah for this Friday",
                "Set up a weekly report task every Monday morning"
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => {
                    setPrompt(example);
                    textInputRef.current?.focus();
                  }}
                >
                  <Text style={styles.exampleText}>{example}</Text>
                  <MaterialIcons name="arrow-forward-ios" size={14} color="#787CA5" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={() => setCustomAlertVisible(false)}
      />

      <CustomSplashScreen
        visible={showSplashScreen}
        lottieSource={require('../../../../../assets/Animation/success.json')}
        mainText="Task Created Successfully!"
        subtitle="Your AI-generated task has been created"
        onComplete={() => {
          console.log('Splash animation completed');
        }}
        onDismiss={() => {
          setShowSplashScreen(false);
        }}
        duration={3000}
        gradientColors={["#05071E", "#0A0D28"]}
        textGradientColors={["#815BF5", "#FC8929"]}
        condition={{
          type: 'custom',
          status: true,
          successAnimation: require('../../../../../assets/Animation/success.json')
        }}
      />
    </SafeAreaView>
  );

  // If used as a modal
  if (isVisible !== undefined && onClose) {
    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleClose}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.8}
        avoidKeyboard={true}
        propagateSwipe={true}
      >
        <ModalContent />
      </Modal>
    );
  }

  // If used as a screen
  return <ModalContent />;
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#05071E',
    maxHeight: screenHeight * 0.95,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  aiIntro: {
    alignItems: 'center',
    marginBottom: 30,
  },
  aiIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiIntroTitle: {
    fontSize: 24,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aiIntroSubtitle: {
    fontSize: 16,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    textAlign: 'center',
    lineHeight: 22,
  },
  userSelectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  userMentionScroll: {
    flexDirection: 'row',
  },
  userMentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#37384B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedUserMention: {
    borderColor: '#815BF5',
    backgroundColor: '#815BF520',
  },
  userMentionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#815BF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  userMentionText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#FFFFFF',
    marginRight: 8,
  },
  promptContainer: {
    marginBottom: 25,
  },
  promptInputContainer: {
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 12,
    backgroundColor: '#0A0D28',
    marginBottom: 15,
    position: 'relative',
  },
  promptInput: {
    padding: 16,
    fontSize: 16,
    fontFamily: 'LatoRegular',
    color: '#FFFFFF',
    minHeight: 120,
    maxHeight: 200,
  },
  mentionSuggestionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#37384B',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#4A4B5C',
    maxHeight: 150,
    zIndex: 1000,
  },
  mentionSuggestionsList: {
    maxHeight: 150,
  },
  mentionSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4B5C',
  },
  mentionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  mentionAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#815BF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mentionAvatarText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  mentionSuggestionText: {
    fontSize: 16,
    fontFamily: 'LatoRegular',
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  taskPreviewContainer: {
    marginBottom: 25,
  },
  taskPreviewTitle: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  taskPreviewCard: {
    backgroundColor: '#0A0D28',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  taskPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    lineHeight: 20,
    marginBottom: 16,
  },
  taskDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    marginLeft: 8,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#815BF5',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#815BF5',
    marginLeft: 6,
  },
  createButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  creditStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#37384B',
    borderRadius: 8,
  },
  creditText: {
    fontSize: 12,
    fontFamily: 'LatoRegular',
    color: '#FC8929',
    marginLeft: 6,
  },
  examplesContainer: {
    marginBottom: 20,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#37384B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    flex: 1,
  },
});