import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
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
import { router } from 'expo-router';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import TaskTemplateForm from '~/components/TaskComponents/TaskTemplateForm';

const { width, height } = Dimensions.get('window');

// Define interfaces
interface Template {
  _id: string;
  title?: string;
  description?: string;
  category?: { _id: string; name: string };
  priority?: string;
  repeat?: boolean;
  repeatType?: string;
  days?: string[];
  subcategory?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface CategoryCardData extends Category {
  templateCount: number;
  color: string;
}

export default function TaskTemplatesScreen() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isViewingCategory, setIsViewingCategory] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { userData, token } = useSelector((state: RootState) => state.auth);

  // Fetch categories from the server
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchCategories = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("https://zapllo.com/api/category/get", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data || []);
      } else {
        console.error("Error fetching categories:", result.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const res = await fetch("https://zapllo.com/api/taskTemplates", { 
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.data || []);
      } else {
        console.error("Error fetching templates:", data.error);
        Alert.alert("Error", "Failed to load templates");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An error occurred while loading templates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTemplates();
    fetchCategories();
  };

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, Template[]> = {};
    
    // Initialize with empty arrays for all categories
    categories.forEach(cat => {
      grouped[cat._id] = [];
    });
    
    // Add a special category for templates without a category
    grouped['uncategorized'] = [];
    
    // Sort templates into categories
    templates.forEach(template => {
      if (template.category && template.category._id) {
        if (!grouped[template.category._id]) {
          grouped[template.category._id] = [];
        }
        grouped[template.category._id].push(template);
      } else {
        grouped['uncategorized'].push(template);
      }
    });
    
    return grouped;
  }, [templates, categories]);

  // Filter templates by search
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return [];
    
    const categoryTemplates = selectedCategory._id === 'uncategorized'
      ? templatesByCategory['uncategorized'] || []
      : templatesByCategory[selectedCategory._id] || [];
    
    if (!searchText.trim()) {
      return categoryTemplates;
    }
    
    const lowerSearch = searchText.toLowerCase();
    return categoryTemplates.filter(
      (t) =>
        t.title?.toLowerCase().includes(lowerSearch) ||
        t.description?.toLowerCase().includes(lowerSearch)
    );
  }, [templatesByCategory, selectedCategory, searchText]);

  // Generate category card data with template counts
  const categoryCards = useMemo(() => {
    return categories
      .filter(cat => (templatesByCategory[cat._id]?.length || 0) > 0)
      .map(cat => ({
        ...cat,
        templateCount: templatesByCategory[cat._id]?.length || 0,
        color: getRandomColorClass()
      }));
  }, [categories, templatesByCategory]);

  // Function to get a random color class for category cards
  function getRandomColorClass() {
    const colors = [
      '#815BF5', '#FC8929', '#017A5B', '#FF4757', '#FFA726',
      '#66BB6A', '#42A5F5', '#AB47BC', '#FF7043', '#26C6DA'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Handler for selecting a category
  function handleCategorySelect(category: Category | CategoryCardData) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
    setIsViewingCategory(true);
    setSearchText("");
  }

  // Handler for going back to category view
  function handleBackToCategories() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsViewingCategory(false);
    setSelectedCategory(null);
    setSearchText("");
  }

  // Handler for viewing template details
  function handleViewTemplate(template: Template) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  }

  // Handler for using template (create task from template)
  function handleUseTemplate(template: Template) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to create task screen with template data
    router.push({
      pathname: '/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen',
      params: { templateData: JSON.stringify(template) }
    });
  }

  // Handler for editing template
  function handleEditTemplate(template: Template) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTemplateToEdit(template);
    setShowCreateModal(true);
  }

  // Handler for deleting template
  function handleDeleteTemplate(template: Template) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTemplateToDelete(template);
    setShowDeleteConfirm(true);
  }

  // Confirm delete template
  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`https://zapllo.com/api/taskTemplates/${templateToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete template");
      }
      
      Alert.alert("Success", "Template deleted successfully!");
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High": return "#FF4757";
      case "Medium": return "#FFA726";
      default: return "#66BB6A";
    }
  };

  const getPriorityBg = (priority?: string) => {
    switch (priority) {
      case "High": return "rgba(255, 71, 87, 0.1)";
      case "Medium": return "rgba(255, 167, 38, 0.1)";
      default: return "rgba(102, 187, 106, 0.1)";
    }
  };

  const renderCategoryCard = ({ item }: { item: CategoryCardData }) => (
    <CategoryCard category={item} onClick={() => handleCategorySelect(item)} />
  );

  const renderTemplateCard = ({ item }: { item: Template }) => (
    <TemplateCard 
      template={item}
      onView={() => handleViewTemplate(item)}
      onUse={() => handleUseTemplate(item)}
      onEdit={() => handleEditTemplate(item)}
      onDelete={() => handleDeleteTemplate(item)}
    />
  );

  const renderSkeletonCard = ({ item }: { item: number }) => (
    <SkeletonCard key={item} />
  );

  const hasAnyTemplates = useMemo(() => {
    return templates.length > 0;
  }, [templates]);

  const categoriesWithTemplatesCount = useMemo(() => {
    return categoryCards.length + (templatesByCategory['uncategorized']?.length > 0 ? 1 : 0);
  }, [categoryCards, templatesByCategory]);

  return (
    <SafeAreaView className="flex-1 bg-[#05071E]">
      <StatusBar barStyle="light-content" backgroundColor="#05071E" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#2A2D47]">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (isViewingCategory) {
              handleBackToCategories();
            } else {
              router.back();
            }
          }}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-xl text-white" style={{ fontFamily: 'LatoBold' }}>
          {isViewingCategory ? selectedCategory?.name : "Task Templates"}
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTemplateToEdit(null);
            setShowCreateModal(true);
          }}
          className="p-2"
        >
          <Ionicons name="add" size={24} color="#815BF5" />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {!isViewingCategory && (
        <View className="px-4 py-4">
          <Text className="text-gray-400 text-sm" style={{ fontFamily: 'LatoRegular' }}>
            Browse your task templates organized by category or create new ones to streamline your workflow.
          </Text>
        </View>
      )}

      {/* Category View Header */}
      {isViewingCategory && (
        <View className="px-4 py-3 border-b border-[#2A2D47]">

          
          {/* Search Bar */}
          <View className="flex-row items-center bg-[#2A2D47] rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#676B93" />
            <TextInput
              placeholder="Search templates..."
              placeholderTextColor="#676B93"
              value={searchText}
              onChangeText={setSearchText}
              className="flex-1 ml-3 text-white"
              style={{ fontFamily: 'LatoRegular' }}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <Ionicons name="close-circle" size={20} color="#676B93" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      <View className="flex-1">
        {loading ? (
          // Loading skeleton
          isViewingCategory ? (
            <FlatList
              key="templates-loading"
              data={Array(6).fill(0).map((_, index) => index)}
              renderItem={renderSkeletonCard}
              keyExtractor={(item) => item.toString()}
              numColumns={1}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              key="categories-loading"
              data={Array(6).fill(0).map((_, index) => index)}
              renderItem={renderSkeletonCard}
              keyExtractor={(item) => item.toString()}
              numColumns={2}
              contentContainerStyle={{ padding: 16 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : isViewingCategory ? (
          // Template view for selected category
          filteredTemplates.length > 0 ? (
            <FlatList
              key="templates-list"
              data={filteredTemplates}
              renderItem={renderTemplateCard}
              keyExtractor={(item) => item._id}
              numColumns={1}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#815BF5"
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4">
              <MaterialIcons name="search-off" size={64} color="#676B93" />
              <Text className="text-white text-lg mt-4" style={{ fontFamily: 'LatoBold' }}>
                No Templates Found
              </Text>
              <Text className="text-gray-400 text-center mt-2" style={{ fontFamily: 'LatoRegular' }}>
                {searchText
                  ? "Try adjusting your search criteria"
                  : `No templates in the "${selectedCategory?.name}" category yet`
                }
              </Text>
              <View className="flex-row gap-3 mt-4">
                {searchText && (
                  <TouchableOpacity
                    onPress={() => setSearchText("")}
                    className="bg-[#2A2D47] px-6 py-3 rounded-xl"
                  >
                    <Text className="text-gray-300" style={{ fontFamily: 'LatoBold' }}>
                      Clear Search
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setTemplateToEdit(null);
                    setShowCreateModal(true);
                  }}
                  className="bg-[#815BF5] px-6 py-3 rounded-xl flex-row items-center"
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                    Create Template
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : (
          // Category grid view
          categoriesWithTemplatesCount > 0 ? (
            <FlatList
              key="categories-list"
              data={[
                ...categoryCards,
                ...(templatesByCategory['uncategorized']?.length > 0 ? [{
                  _id: 'uncategorized',
                  name: 'Uncategorized',
                  templateCount: templatesByCategory['uncategorized'].length,
                  color: '#676B93'
                }] : [])
              ]}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#815BF5"
                />
              }
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4">
              <MaterialIcons name="folder-open" size={64} color="#676B93" />
              <Text className="text-white text-lg mt-4" style={{ fontFamily: 'LatoBold' }}>
                No Templates Found
              </Text>
              <Text className="text-gray-400 text-center mt-2" style={{ fontFamily: 'LatoRegular' }}>
                Create your first task template to get started
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTemplateToEdit(null);
                  setShowCreateModal(true);
                }}
                className="bg-[#815BF5] px-6 py-3 rounded-xl flex-row items-center mt-4"
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                  Create Template
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>

      {/* Task Template Form */}
      <TaskTemplateForm
        isVisible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setTemplateToEdit(null);
        }}
        existingTemplate={templateToEdit}
        onSuccess={() => {
          fetchTemplates();
          setTemplateToEdit(null);
        }}
      />

      {/* Template Details Modal */}
      <Modal
        isVisible={showTemplateDetails}
        onBackdropPress={() => setShowTemplateDetails(false)}
        style={{ margin: 0, justifyContent: 'flex-end' }}
      >
        <View className="bg-[#1A1D36] rounded-t-3xl max-h-[80%]">
          <View className="flex-row items-center justify-between p-4 border-b border-[#2A2D47]">
            <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
              Template Details
            </Text>
            <TouchableOpacity onPress={() => setShowTemplateDetails(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {selectedTemplate && (
              <View>
                <Text className="text-white text-xl mb-2" style={{ fontFamily: 'LatoBold' }}>
                  {selectedTemplate.title}
                </Text>
                
                <View className="flex-row items-center mb-4">
                  {selectedTemplate.category && (
                    <View className="bg-[#2A2D47] px-3 py-1 rounded-full mr-2">
                      <Text className="text-gray-300 text-xs" style={{ fontFamily: 'LatoRegular' }}>
                        {selectedTemplate.category.name}
                      </Text>
                    </View>
                  )}
                  {selectedTemplate.priority && (
                    <View 
                      className="px-3 py-1 rounded-full mr-2"
                      style={{ backgroundColor: getPriorityBg(selectedTemplate.priority) }}
                    >
                      <Text 
                        className="text-xs" 
                        style={{ 
                          fontFamily: 'LatoRegular',
                          color: getPriorityColor(selectedTemplate.priority)
                        }}
                      >
                        {selectedTemplate.priority} Priority
                      </Text>
                    </View>
                  )}
                  {selectedTemplate.repeat && (
                    <View className="bg-[#815BF5] px-3 py-1 rounded-full">
                      <Text className="text-white text-xs" style={{ fontFamily: 'LatoRegular' }}>
                        {selectedTemplate.repeatType || "Repeating"}
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="text-gray-300 mb-6" style={{ fontFamily: 'LatoRegular' }}>
                  {selectedTemplate.description}
                </Text>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowTemplateDetails(false);
                      handleUseTemplate(selectedTemplate);
                    }}
                    className="flex-1 bg-[#815BF5] py-4 rounded-xl flex-row items-center justify-center"
                  >
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                    <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                      Use Template
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setShowTemplateDetails(false);
                      handleEditTemplate(selectedTemplate);
                    }}
                    className="bg-[#2A2D47] px-6 py-4 rounded-xl"
                  >
                    <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteConfirm}
        onBackdropPress={() => !isDeleting && setShowDeleteConfirm(false)}
        style={{ margin: 20 }}
      >
        <View className="bg-[#1A1D36] rounded-2xl p-6">
          <Text className="text-white text-lg mb-2" style={{ fontFamily: 'LatoBold' }}>
            Delete Template
          </Text>
          <Text className="text-gray-300 mb-6" style={{ fontFamily: 'LatoRegular' }}>
            Are you sure you want to delete "{templateToDelete?.title}"? This action cannot be undone.
          </Text>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="bg-[#2A2D47] px-6 py-3 rounded-xl"
            >
              <Text className="text-gray-300" style={{ fontFamily: 'LatoBold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={confirmDeleteTemplate}
              disabled={isDeleting}
              className="bg-[#FF4757] px-6 py-3 rounded-xl flex-row items-center"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="delete" size={16} color="#FFFFFF" />
                  <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                    Delete
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Category Card Component
function CategoryCard({ 
  category, 
  onClick 
}: { 
  category: CategoryCardData; 
  onClick: () => void; 
}) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="bg-[#1A1D36] rounded-2xl mb-4 overflow-hidden"
      style={{ width: (width - 48) / 2 }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[category.color, `${category.color}80`]}
        className="h-24 justify-end p-3"
      >
        <View className="flex-row items-center p-2">
          <Entypo name="folder" size={16} color="#FFFFFF" />
          <Text className="text-white text-sm ml-2" style={{ fontFamily: 'LatoBold' }}>
            {category.name}
          </Text>
        </View>
      </LinearGradient>
      
      <View className="p-3">
        <Text className="text-gray-400 text-xs mb-2" style={{ fontFamily: 'LatoRegular' }}>
          Browse and manage templates in the {category.name} category
        </Text>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-xs" style={{ fontFamily: 'LatoRegular' }}>
            {category.templateCount} {category.templateCount === 1 ? 'template' : 'templates'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#815BF5" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Template Card Component
function TemplateCard({ 
  template, 
  onView, 
  onUse, 
  onEdit, 
  onDelete 
}: { 
  template: Template;
  onView: () => void;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "High": return "#FF4757";
      case "Medium": return "#FFA726";
      default: return "#66BB6A";
    }
  };

  const getPriorityBg = (priority?: string) => {
    switch (priority) {
      case "High": return "rgba(255, 71, 87, 0.1)";
      case "Medium": return "rgba(255, 167, 38, 0.1)";
      default: return "rgba(102, 187, 106, 0.1)";
    }
  };

  return (
    <View className="bg-[#1A1D36] rounded-2xl p-4 mb-4">
      <TouchableOpacity onPress={onView} activeOpacity={0.8}>
        <Text 
          className="text-white text-lg mb-2" 
          style={{ fontFamily: 'LatoBold' }}
          numberOfLines={2}
        >
          {template.title}
        </Text>
        
        <Text 
          className="text-gray-400 text-sm mb-3" 
          style={{ fontFamily: 'LatoRegular' }}
          numberOfLines={3}
        >
          {template.description}
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-4">
          {template.priority && (
            <View 
              className="px-3 py-1 rounded-full flex-row items-center"
              style={{ backgroundColor: getPriorityBg(template.priority) }}
            >
              <View 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getPriorityColor(template.priority) }}
              />
              <Text 
                className="text-xs" 
                style={{ 
                  fontFamily: 'LatoRegular',
                  color: getPriorityColor(template.priority)
                }}
              >
                {template.priority} Priority
              </Text>
            </View>
          )}
          
          {template.repeat && (
            <View className="bg-[#815BF5] bg-opacity-20 px-3 py-1 rounded-full">
              <Text className="text-[#815BF5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                {template.repeatType || "Repeating"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View className="flex-row justify-between items-center pt-3 border-t border-[#2A2D47]">
        <TouchableOpacity
          onPress={onUse}
          className="bg-[#815BF5] px-4 py-2 rounded-xl flex-row items-center"
        >
          <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'LatoBold' }}>
            Use
          </Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={onEdit}
            className="bg-[#2A2D47] p-2 rounded-lg"
          >
            <MaterialIcons name="edit" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onDelete}
            className="bg-[#FF4757] bg-opacity-20 p-2 rounded-lg"
          >
            <MaterialIcons name="delete" size={16} color="#FF4757" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <View className="bg-[#1A1D36] rounded-2xl p-4 mb-4">
      <View className="bg-[#2A2D47] h-6 w-3/4 rounded mb-2" />
      <View className="bg-[#2A2D47] h-4 w-full rounded mb-1" />
      <View className="bg-[#2A2D47] h-4 w-2/3 rounded mb-4" />
      
      <View className="flex-row gap-2 mb-4">
        <View className="bg-[#2A2D47] h-6 w-20 rounded-full" />
        <View className="bg-[#2A2D47] h-6 w-16 rounded-full" />
      </View>
      
      <View className="flex-row justify-between items-center pt-3 border-t border-[#2A2D47]">
        <View className="bg-[#2A2D47] h-8 w-16 rounded-xl" />
        <View className="flex-row gap-2">
          <View className="bg-[#2A2D47] h-8 w-8 rounded-lg" />
          <View className="bg-[#2A2D47] h-8 w-8 rounded-lg" />
        </View>
      </View>
    </View>
  );
}