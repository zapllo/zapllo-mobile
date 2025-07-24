import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
  Keyboard,
  Dimensions,
  TouchableWithoutFeedback,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
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

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function AiSuggestionScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const textInputRef = useRef<TextInput>(null);
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [aiCredits, setAiCredits] = useState<number>(0);
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
  const [mentionStartPosition, setMentionStartPosition] = useState(-1);
  const [selectedMentionedUser, setSelectedMentionedUser] = useState<User | null>(null);

  // Fetch users and AI credits
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch users for @mention functionality
        const usersResponse = await axios.get(`${backend_Host}/users/organization`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setUsers(usersResponse.data.data);

        // Fetch AI credits
        const creditsResponse = await axios.get(`${backend_Host}/organization/ai-credits`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (creditsResponse.data.success) {
          setAiCredits(creditsResponse.data.aiCredits);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    if (token) {
      fetchInitialData();
    }
  }, [token]);

  // Handle @mention detection and filtering (similar to web version)
  useEffect(() => {
    // Only process if we have users data
    if (users.length === 0) return;
    
    const lastAtIndex = prompt.lastIndexOf('@', cursorPosition);
    const lastSpaceIndex = prompt.lastIndexOf(' ', cursorPosition);
    const lastNewlineIndex = prompt.lastIndexOf('\n', cursorPosition);
    
    // Check if @ is at the start or after a space/newline
    const isValidMentionStart = lastAtIndex !== -1 && 
      (lastAtIndex === 0 || 
       prompt[lastAtIndex - 1] === ' ' || 
       prompt[lastAtIndex - 1] === '\n');
    
    if (isValidMentionStart && lastAtIndex > Math.max(lastSpaceIndex, lastNewlineIndex)) {
      const query = prompt.substring(lastAtIndex + 1, cursorPosition);
      
      // Set mention start position
      if (mentionStartPosition !== lastAtIndex) {
        setMentionStartPosition(lastAtIndex);
      }
      
      // Only update if query actually changed
      if (query !== mentionQuery) {
        setMentionQuery(query);
        
        // Filter users based on query (same as web version)
        const filtered = users.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const firstName = user.firstName.toLowerCase();
          const lastName = user.lastName.toLowerCase();
          const searchQuery = query.toLowerCase();
          
          return fullName.includes(searchQuery) || 
                 firstName.includes(searchQuery) || 
                 lastName.includes(searchQuery);
        });
        setFilteredUsers(filtered);
        
        setShowMentionSuggestions(filtered.length > 0);
      }
    } else {
      if (showMentionSuggestions) {
        setShowMentionSuggestions(false);
        setMentionQuery('');
        setFilteredUsers([]);
        setMentionStartPosition(-1);
      }
    }
  }, [prompt, cursorPosition, users, mentionQuery, showMentionSuggestions, mentionStartPosition]);

  // Suggested prompts similar to web version
  const suggestedPrompts = [
    "Schedule a team meeting next Thursday",
    "Prepare Q4 marketing report",
    "Review designs for homepage update",
    "Follow up with client about proposal",
    "Create a high priority bug fix task for next Monday",
    "Set up a weekly report task every Monday morning"
  ];

  const handleClose = () => {
    setPrompt('');
    setTaskData(null);
    setCreditStatus(null);
    setSelectedUserId(null);
    setShowMentionSuggestions(false);
    setMentionStartPosition(-1);
    setSelectedMentionedUser(null);
    Keyboard.dismiss();
    navigation.goBack();
  };

  const handleInputChange = (text: string) => {
    setPrompt(text);
  };

  const handleSelectionChange = (event: any) => {
    const newPosition = event.nativeEvent.selection.start;
    setCursorPosition(newPosition);
  };

  const handleTextInputFocus = () => {
    console.log('TextInput focused');
  };

  const handleMentionSelect = (user: User) => {
    if (mentionStartPosition !== -1 && textInputRef.current) {
      // Replace the @mention text with the selected user's name (similar to web version)
      const beforeMention = prompt.substring(0, mentionStartPosition);
      const afterMention = prompt.substring(cursorPosition);
      const mentionText = `@${user.firstName} ${user.lastName} `;
      
      const newText = beforeMention + mentionText + afterMention;
      const newCursorPosition = mentionStartPosition + mentionText.length;
      
      setPrompt(newText);
      setSelectedMentionedUser(user);
      setShowMentionSuggestions(false);
      setMentionStartPosition(-1);
      setSelectedUserId(user._id);
      
      // Set focus back to textarea and position cursor after the inserted name
      setCursorPosition(newCursorPosition);
      
      // Keep focus on the input
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleAiSuggestion = async () => {
    if (!prompt.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Please enter a task description');
      setCustomAlertType('error');
      return;
    }

    if (aiCredits <= 0) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('No AI credits remaining. Please contact your administrator.');
      setCustomAlertType('error');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Extract assigned user from the prompt if one was selected (similar to web version)
      let assignedUserId = null;
      if (selectedMentionedUser) {
        assignedUserId = selectedMentionedUser._id;
      } else if (selectedUserId) {
        assignedUserId = selectedUserId;
      } else {
        // Try to find any @mentions in the text (similar to web version)
        try {
          const mentionRegex = /@([a-zA-Z]+\s[a-zA-Z]+)/g;
          const matches = prompt.match(mentionRegex);
          if (matches && matches.length > 0) {
            // Extract the name without the @ symbol
            const mentionedName = matches[0].substring(1).trim();
            // Find user by name
            const user = users.find(u =>
              `${u.firstName} ${u.lastName}`.toLowerCase() === mentionedName.toLowerCase()
            );
            if (user) {
              assignedUserId = user._id;
              setSelectedMentionedUser(user);
            }
          }
        } catch (error) {
          console.error('Error extracting @mentions:', error);
          // Continue without assigning a user
        }
      }

      const response = await axios.post(
        `${backend_Host}/tasks/suggest`,
        {
          prompt: prompt.trim(),
          assignedUserId: assignedUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Update AI credits from response if available
        if (response.data.creditStatus) {
          setAiCredits(response.data.creditStatus.remaining);
        }
        
        setTaskData(response.data.taskData);
        setCreditStatus(response.data.creditStatus);
        setCustomAlertVisible(true);
        setCustomAlertMessage('AI suggestion generated successfully!');
        setCustomAlertType('success');
      } else {
        // Handle credit errors specifically
        if (response.data.creditStatus && response.data.creditStatus.remaining === 0) {
          setCustomAlertVisible(true);
          setCustomAlertMessage('No AI credits remaining. Please contact your administrator.');
          setCustomAlertType('error');
        } else {
          setCustomAlertVisible(true);
          setCustomAlertMessage('Failed to generate task from AI: ' + (response.data.error || 'Unknown error'));
          setCustomAlertType('error');
        }
      }
    } catch (error: any) {
      console.error('Error generating AI suggestion:', error);
      
      if (error.response?.data?.creditStatus?.remaining === 0) {
        setCustomAlertVisible(true);
        setCustomAlertMessage('No AI credits remaining. Please contact your administrator.');
        setCustomAlertType('error');
        setAiCredits(0);
      } else {
        let errorMessage = error.response?.data?.error || 'Failed to process AI prompt';
        setCustomAlertVisible(true);
        setCustomAlertMessage(errorMessage);
        setCustomAlertType('error');
      }
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

  
  const renderMentionSuggestions = () => {
    if (!showMentionSuggestions || filteredUsers.length === 0) return null;

    return (
      <View style={styles.mentionSuggestionsContainer}>
        {filteredUsers.slice(0, 5).map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.mentionSuggestionItem}
            onPress={(e) => {
              e.stopPropagation();
              handleMentionSelect(item);
            }}
            activeOpacity={0.7}
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
        ))}
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

  // Prepare data for FlatList
  const renderData = [
    { type: 'aiIntro' },
    { type: 'suggestedPrompts' },
    ...(users.length > 0 ? [{ type: 'userSelection' }] : []),
    { type: 'promptInput' },
    ...(taskData ? [{ type: 'taskPreview' }] : []),
  ];

  const renderItem = ({ item }: { item: { type: string } }) => {
    switch (item.type) {
      case 'aiIntro':
        return (
          <View style={styles.aiIntro}>
            <View style={styles.aiIconContainer}>
              <LinearGradient
                colors={['#815BF5', '#4929fc']}
                style={styles.aiIcon}
              >
                <MaterialIcons name="auto-awesome" size={32} color="#FFFFFF" />
              </LinearGradient>
              {/* Animated rings around AI icon */}
              <View style={[styles.aiIconRing, styles.aiIconRing1]} />
              <View style={[styles.aiIconRing, styles.aiIconRing2]} />
            </View>
            <Text style={styles.aiIntroTitle}>Describe your task</Text>
            <Text style={styles.aiIntroSubtitle}>
              Tell me what you need to do and I'll help you create a structured task. Use @ to mention users.
            </Text>
            
            {/* AI Credits Warning */}
            {aiCredits <= 5 && (
              <View style={styles.creditsWarning}>
                <MaterialIcons name="warning" size={16} color="#FC8929" />
                <Text style={styles.creditsWarningText}>
                  {aiCredits === 0 ? 'No AI credits remaining' : `Only ${aiCredits} credit${aiCredits !== 1 ? 's' : ''} left`}
                </Text>
              </View>
            )}
          </View>
        );

      case 'suggestedPrompts':
        return (
          <View style={styles.suggestedPromptsContainer}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="lightbulb" size={16} color="#FC8929" /> Suggested Prompts
            </Text>
            <View style={styles.suggestedPromptsGrid}>
              {suggestedPrompts.slice(0, 4).map((promptText, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedPromptItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    setPrompt(promptText);
                    textInputRef.current?.focus();
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.suggestedPromptText}>{promptText}</Text>
                  <MaterialIcons name="arrow-forward-ios" size={12} color="#787CA5" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );



      case 'promptInput':
        return (
          <View style={styles.promptContainer}>
            <Text style={styles.sectionTitle}>Task Description</Text>
            <TouchableWithoutFeedback 
              onPress={(e) => {
                e.stopPropagation();
                textInputRef.current?.focus();
              }}
            >
              <View style={styles.promptInputContainer}>
                <TextInput
                  ref={textInputRef}
                  style={styles.promptInput}
                  value={prompt}
                  onChangeText={handleInputChange}
                  onSelectionChange={handleSelectionChange}
                  onFocus={handleTextInputFocus}
                  placeholder="e.g., 'Create a marketing presentation for next Friday at 3 PM' (Use @ to mention users)"
                  placeholderTextColor="#787CA5"
                  multiline={true}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  keyboardType="default"
                  returnKeyType="default"
                  enablesReturnKeyAutomatically={false}
                  scrollEnabled={false}
                  showSoftInputOnFocus={true}
                  editable={true}
                  contextMenuHidden={false}
                />
                {renderMentionSuggestions()}
              </View>
            </TouchableWithoutFeedback>
            
            {/* Selected user chip (similar to web version) */}
            {selectedMentionedUser && (
              <View style={styles.selectedUserChip}>
                {selectedMentionedUser.profilePic ? (
                  <Image source={{ uri: selectedMentionedUser.profilePic }} style={styles.selectedUserAvatar} />
                ) : (
                  <View style={styles.selectedUserAvatarPlaceholder}>
                    <Text style={styles.selectedUserAvatarText}>
                      {selectedMentionedUser.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <Text style={styles.selectedUserText}>
                  Assigning to <Text style={styles.selectedUserName}>{selectedMentionedUser.firstName} {selectedMentionedUser.lastName}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.removeUserButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedMentionedUser(null);
                    setSelectedUserId(null);
                  }}
                >
                  <MaterialIcons name="close" size={16} color="#787CA5" />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.generateButton, 
                (!prompt.trim() || isLoading || aiCredits <= 0) && styles.generateButtonDisabled
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleAiSuggestion();
              }}
              disabled={isLoading || !prompt.trim() || aiCredits <= 0}
            >
              <LinearGradient
                colors={(!prompt.trim() || isLoading || aiCredits <= 0) ? ['#37384B', '#37384B'] : ['#4929fc', '#815BF5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.generateButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>
                      {aiCredits <= 0 ? 'No Credits Left' : 'Generate Task'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {/* AI explainer (similar to web version) */}
            <View style={styles.aiExplainer}>
              <MaterialIcons name="info" size={16} color="#815BF5" />
              <View style={styles.aiExplainerContent}>
                <Text style={styles.aiExplainerText}>
                  The AI will analyze your request and create a task with suggested title, description, priority, 
                  category, and due date. You can edit these details before saving.
                </Text>
              </View>
            </View>

            {/* Credit usage info */}
            <View style={styles.creditUsageInfo}>
              <MaterialIcons name="info" size={14} color="#787CA5" />
              <Text style={styles.creditUsageText}>
                Each AI task generation uses 1 credit
              </Text>
            </View>
          </View>
        );

      case 'taskPreview':
        return renderTaskPreview();

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#05071E" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Task Assistant</Text>
          <Text style={styles.headerSubtitle}>Turn your ideas into structured tasks</Text>
        </View>
        <View style={[
          styles.creditsBadge,
          {
            backgroundColor: aiCredits > 10 ? '#065F46' : aiCredits > 0 ? '#92400E' : '#7F1D1D'
          }
        ]}>
          {aiCredits <= 5 && <MaterialIcons name="warning" size={12} color="#FFFFFF" />}
          <Text style={styles.creditsText}>{aiCredits}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.dismissKeyboardArea}>
            <FlatList
              data={renderData}
              keyExtractor={(item, index) => `${item.type}-${index}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={styles.flatListContent}
              bounces={true}
              overScrollMode="auto"
              scrollEventThrottle={16}
            />
          </View>
        </TouchableWithoutFeedback>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05071E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
  },
  closeButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    marginTop: 2,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    justifyContent: 'center',
  },
  creditsText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  dismissKeyboardArea: {
    flex: 1,
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  aiIntro: {
    alignItems: 'center',
    marginBottom: 30,
  },
  aiIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#815BF520',
    borderRadius: 50,
  },
  aiIconRing1: {
    width: 80,
    height: 80,
    borderColor: '#815BF530',
  },
  aiIconRing2: {
    width: 96,
    height: 96,
    borderColor: '#815BF520',
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
  creditsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#92400E20',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#92400E40',
  },
  creditsWarningText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#FC8929',
    marginLeft: 8,
  },
  suggestedPromptsContainer: {
    marginBottom: 25,
  },
  suggestedPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestedPromptItem: {
    width: '48%',
    backgroundColor: '#37384B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  suggestedPromptText: {
    fontSize: 12,
    fontFamily: 'LatoRegular',
    color: '#ffffff',
    flex: 1,
    lineHeight: 16,
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
    textAlignVertical: 'top',
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
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#37384B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#815BF5',
  },
  selectedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedUserAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#815BF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedUserAvatarText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  selectedUserText: {
    fontSize: 14,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    flex: 1,
  },
  selectedUserName: {
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  removeUserButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#4A4B5C',
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
  aiExplainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#37384B20',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#37384B40',
  },
  aiExplainerContent: {
    flex: 1,
    marginLeft: 8,
  },
  aiExplainerText: {
    fontSize: 12,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    lineHeight: 16,
  },
  creditUsageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#37384B20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#37384B40',
  },
  creditUsageText: {
    fontSize: 12,
    fontFamily: 'LatoRegular',
    color: '#787CA5',
    marginLeft: 6,
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
});