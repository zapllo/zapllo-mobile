import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, AntDesign, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import ToastAlert, { ToastType } from '~/components/ToastAlert';

const { width, height } = Dimensions.get('window');

// Define interfaces
interface TemplateData {
  _id?: string;
  title?: string;
  description?: string;
  priority?: string;
  subcategory?: string;
  repeat?: boolean;
  repeatType?: string;
  days?: string[];
  dates?: number[];
  attachments?: string[];
  links?: string[];
  reminders?: {
    notificationType: string;
    type: string;
    value?: number;
    date?: Date;
    sent?: boolean;
  }[];
}

interface DirectoryData {
  categoryName: string;
  description: string;
  iconColor: string;
  imagePath: string;
  subcategories: string[];
  templates: TemplateData[];
}

interface CategoryCardProps {
  category: DirectoryData;
  onClick: () => void;
}

interface TemplateCardProps {
  template: TemplateData;
  categoryName: string;
}

export default function TaskDirectoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isViewingCategory, setIsViewingCategory] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const { userData, token } = useSelector((state: RootState) => state.auth);

  // Helper function to show toast
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };

  // Get subcategories for the selected category
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = directoryData.find(cat => cat.categoryName === selectedCategory);
    return category ? ["All", ...category.subcategories] : ["All"];
  }, [selectedCategory]);

  // Filter templates when viewing a specific category
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryData = directoryData.find(cat => cat.categoryName === selectedCategory);
    if (!categoryData) return [];

    let templates = categoryData.templates;
    
    // Filter by subcategory
    if (selectedSubcategory !== "All") {
      templates = templates.filter(tmpl => tmpl.subcategory === selectedSubcategory);
    }

    // Filter by search text
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      templates = templates.filter(tmpl =>
        tmpl.title?.toLowerCase().includes(lowerSearch) ||
        tmpl.description?.toLowerCase().includes(lowerSearch)
      );
    }

    return templates;
  }, [selectedCategory, searchText, selectedSubcategory]);

  const handleCategorySelect = (categoryName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryName);
    setIsViewingCategory(true);
    setSearchText("");
    setSelectedSubcategory("All");
  };

  const handleBackToCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsViewingCategory(false);
    setSelectedCategory(null);
    setSelectedSubcategory("All");
    setSearchText("");
  };

  const handleViewTemplate = (template: TemplateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  };

  const handleCopyTemplate = (template: TemplateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTemplate(template);
    setShowConfirmation(true);
  };

  const copyTemplate = async () => {
    if (!selectedTemplate || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      // 1) Fetch all existing categories
      const catRes = await fetch('https://zapllo.com/api/category/get', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!catRes.ok) {
        const errData = await catRes.json();
        throw new Error(errData.error || 'Failed to fetch categories');
      }

      const catJson = await catRes.json();
      const allCategories = catJson.data || [];

      // 2) Check if user's org already has a matching category
      const foundCategory = allCategories.find(
        (c: any) => c.name.toLowerCase() === selectedCategory.toLowerCase()
      );

      let categoryId;

      // 3) If not found, create it
      if (!foundCategory) {
        const createCatRes = await fetch('https://zapllo.com/api/category/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: selectedCategory }),
        });

        if (!createCatRes.ok) {
          const createErrData = await createCatRes.json();
          throw new Error(createErrData.error || 'Failed to create category');
        }

        const createCatJson = await createCatRes.json();
        categoryId = createCatJson.data._id;
      } else {
        categoryId = foundCategory._id;
      }

      // 4) Create the new template
      const bodyData: any = {
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        priority: selectedTemplate.priority,
        category: categoryId,
        subcategory: selectedTemplate.subcategory,
        repeat: selectedTemplate.repeat || false,
        days: selectedTemplate.days || [],
        dates: selectedTemplate.dates || [],
        attachments: selectedTemplate.attachments || [],
        links: selectedTemplate.links || [],
        reminders: selectedTemplate.reminders || [],
      };

      // Only add repeatType if it exists and is not empty
      if (selectedTemplate.repeatType && selectedTemplate.repeatType.trim() !== '') {
        bodyData.repeatType = selectedTemplate.repeatType;
      }

      // Only add subcategory if it exists and is not empty
      if (selectedTemplate.subcategory && selectedTemplate.subcategory.trim() !== '') {
        bodyData.subcategory = selectedTemplate.subcategory;
      } else {
        delete bodyData.subcategory;
      }

      const res = await fetch('https://zapllo.com/api/taskTemplates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to copy template');
      }

      // Show success toast
      showToastMessage(
        'success',
        'Template Copied!',
        `"${selectedTemplate.title}" has been successfully copied to your organization.`
      );
      
      // Close modals
      setShowConfirmation(false);
      setSelectedTemplate(null);
      
    } catch (error: any) {
      console.error('Error copying template:', error);
      showToastMessage(
        'error',
        'Copy Failed',
        `Error copying template: ${error.message}`
      );
    } finally {
      setIsLoading(false);
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

  const renderCategoryCard = ({ item }: { item: DirectoryData }) => (
    <CategoryCard category={item} onClick={() => handleCategorySelect(item.categoryName)} />
  );

  const renderTemplateCard = ({ item }: { item: TemplateData }) => (
    <TemplateCard 
      template={item} 
      categoryName={selectedCategory || ""} 
      onView={() => handleViewTemplate(item)}
      onCopy={() => handleCopyTemplate(item)}
    />
  );

  const renderSubcategoryTab = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedSubcategory(item);
      }}
      className={`px-4 py-2 mx-1 rounded-full ${
        selectedSubcategory === item ? 'bg-[#815BF5]' : 'bg-[#2A2D47]'
      }`}
    >
      <Text
        className={`text-sm ${
          selectedSubcategory === item ? 'text-white' : 'text-gray-400'
        }`}
        style={{ fontFamily: 'LatoBold' }}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

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
          {isViewingCategory ? selectedCategory : "Task Directory"}
        </Text>
        
        <View className="w-8" />
      </View>

      {isViewingCategory ? (
        // Category Templates View
        <View className="flex-1">
          {/* Subcategory Tabs */}
          <View className="py-3">
            <FlatList
              data={subcategories}
              renderItem={renderSubcategoryTab}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>

          {/* Search Bar */}
          <View className="px-4 mb-4">
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
              }}
            >
              <Ionicons name="search" size={20} color="#787CA5" />
              <TextInput
                placeholder="Search templates..."
                placeholderTextColor="#787CA5"
                value={searchText}
                onChangeText={setSearchText}
                style={{
                  flex: 1,
                  marginLeft: 12,
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '500',
                  fontFamily: 'LatoRegular'
                }}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={20} color="#787CA5" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>

          {/* Templates List */}
          {filteredTemplates.length > 0 ? (
            <FlatList
              data={filteredTemplates}
              renderItem={renderTemplateCard}
              keyExtractor={(item, index) => `${selectedCategory}-${index}`}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4">
              <MaterialIcons name="search-off" size={64} color="#676B93" />
              <Text className="text-white text-lg mt-4" style={{ fontFamily: 'LatoBold' }}>
                No Templates Found
              </Text>
              <Text className="text-gray-400 text-center mt-2" style={{ fontFamily: 'LatoRegular' }}>
                Try adjusting your search criteria or select a different subcategory
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  setSelectedSubcategory("All");
                }}
                className="bg-[#815BF5] px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // Categories Grid View
        <View className="flex-1">
          <View className="px-4 py-4">
            <Text className="text-white text-lg mb-2" style={{ fontFamily: 'LatoBold' }}>
              Browse Template Categories
            </Text>
            <Text className="text-gray-400 text-sm" style={{ fontFamily: 'LatoRegular' }}>
              Discover ready-made templates organized by category. Copy any template to your organization with a single tap.
            </Text>
          </View>

          <FlatList
            data={directoryData}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.categoryName}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

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
                  <View className="bg-[#2A2D47] px-3 py-1 rounded-full mr-2">
                    <Text className="text-gray-300 text-xs" style={{ fontFamily: 'LatoRegular' }}>
                      {selectedCategory}
                    </Text>
                  </View>
                  {selectedTemplate.subcategory && (
                    <View className="bg-[#815BF5] px-3 py-1 rounded-full mr-2">
                      <Text className="text-white text-xs" style={{ fontFamily: 'LatoRegular' }}>
                        {selectedTemplate.subcategory}
                      </Text>
                    </View>
                  )}
                  <View 
                    className="px-3 py-1 rounded-full"
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
                </View>

                <Text className="text-gray-300 mb-4" style={{ fontFamily: 'LatoRegular' }}>
                  {selectedTemplate.description}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowTemplateDetails(false);
                    handleCopyTemplate(selectedTemplate);
                  }}
                  className="bg-[#815BF5] py-4 rounded-xl flex-row items-center justify-center"
                >
                  <MaterialIcons name="content-copy" size={20} color="#FFFFFF" />
                  <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                    Copy to My Templates
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isVisible={showConfirmation}
        onBackdropPress={() => !isLoading && setShowConfirmation(false)}
        style={{ margin: 20 }}
      >
        <View className="bg-[#1A1D36] rounded-2xl p-6">
          <Text className="text-white text-lg mb-2" style={{ fontFamily: 'LatoBold' }}>
            Copy Template?
          </Text>
          <Text className="text-gray-300 mb-6" style={{ fontFamily: 'LatoRegular' }}>
            This will create a copy of "{selectedTemplate?.title}" in your organization. Are you sure you want to proceed?
          </Text>

          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={() => setShowConfirmation(false)}
              disabled={isLoading}
              className="bg-[#2A2D47] px-6 py-3 rounded-xl mr-3"
            >
              <Text className="text-gray-300" style={{ fontFamily: 'LatoBold' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={copyTemplate}
              disabled={isLoading}
              className="bg-[#815BF5] px-6 py-3 rounded-xl flex-row items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="content-copy" size={16} color="#FFFFFF" />
                  <Text className="text-white ml-2" style={{ fontFamily: 'LatoBold' }}>
                    Copy
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    </SafeAreaView>
  );
}

// Category Card Component
function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="bg-[#1A1D36] rounded-2xl mb-4 overflow-hidden"
      style={{ width: (width - 48) / 2 }}
      activeOpacity={0.8}
    >
      <View className="h-24 relative">
        <Image
          source={{ uri: category.imagePath }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          className="absolute inset-0"
        />
        <View className="absolute bottom-2 left-3 flex-row items-center">
          <Entypo name="folder" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs ml-1" style={{ fontFamily: 'LatoBold' }}>
            {category.categoryName}
          </Text>
        </View>
      </View>
      
      <View className="p-3">
        <Text 
          className="text-gray-300 text-xs mb-2" 
          style={{ fontFamily: 'LatoRegular' }}
          numberOfLines={2}
        >
          {category.description}
        </Text>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-xs" style={{ fontFamily: 'LatoRegular' }}>
            {category.templates.length} templates
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
  categoryName, 
  onView, 
  onCopy 
}: TemplateCardProps & { onView: () => void; onCopy: () => void }) {
  return (
    <View className="bg-[#1A1D36] rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <Text 
          className="text-white text-base flex-1 mr-2" 
          style={{ fontFamily: 'LatoBold' }}
          numberOfLines={2}
        >
          {template.title}
        </Text>
        {template.subcategory && (
          <View className="bg-[#2A2D47] px-2 py-1 rounded-lg">
            <Text className="text-gray-300 text-xs" style={{ fontFamily: 'LatoRegular' }}>
              {template.subcategory}
            </Text>
          </View>
        )}
      </View>

      <Text 
        className="text-gray-400 text-sm mb-3" 
        style={{ fontFamily: 'LatoRegular' }}
        numberOfLines={3}
      >
        {template.description}
      </Text>

      <View className="flex-row items-center justify-between">
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
            {template.priority}
          </Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={onView}
            className="bg-[#2A2D47] px-4 py-2 rounded-xl mr-2"
          >
            <Text className="text-gray-300 text-xs" style={{ fontFamily: 'LatoBold' }}>
              View
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onCopy}
            className="bg-[#815BF5] px-4 py-2 rounded-xl flex-row items-center"
          >
            <MaterialIcons name="content-copy" size={14} color="#FFFFFF" />
            <Text className="text-white text-xs ml-1" style={{ fontFamily: 'LatoBold' }}>
              Copy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getPriorityColor(priority?: string) {
  switch (priority) {
    case "High": return "#FF4757";
    case "Medium": return "#FFA726";
    default: return "#66BB6A";
  }
}

function getPriorityBg(priority?: string) {
  switch (priority) {
    case "High": return "rgba(255, 71, 87, 0.1)";
    case "Medium": return "rgba(255, 167, 38, 0.1)";
    default: return "rgba(102, 187, 106, 0.1)";
  }
}

// Directory Data (truncated for brevity - include your full data here)
const directoryData: DirectoryData[] = [
  {
    categoryName: "Sales",
    description: "Templates to streamline your sales process, from lead qualification to follow-ups and account management.",
    iconColor: "bg-blue-700",
    imagePath: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Lead Generation", "Qualification", "Closing", "Account Management", "Sales Operations"],
    templates: [
      { title: "Follow-up Email Campaign", description: "Automated tasks for following up with potential leads who have shown interest in our products.", priority: "High", subcategory: "Lead Generation" },
      { title: "Prospect Research", description: "Daily tasks for researching and qualifying potential leads before outreach begins.", priority: "Medium", subcategory: "Qualification" },
      { title: "Sales Pipeline Review", description: "Weekly review of the entire sales pipeline to identify bottlenecks and opportunities.", priority: "High", subcategory: "Sales Operations" },
      { title: "Lead Qualification", description: "Process for qualifying new leads and determining their sales readiness.", priority: "Low", subcategory: "Qualification" },
      { title: "Account Renewal Tracking", description: "Monitor upcoming account renewals to ensure timely follow-up with customers.", priority: "Medium", subcategory: "Account Management" },
    ],
  },
  {
    categoryName: "Marketing",
    description: "Templates for content creation, social media management, SEO, and campaign planning to boost your marketing efforts.",
    iconColor: "bg-purple-700",
    imagePath: "https://plus.unsplash.com/premium_photo-1684179641331-e89c6320b6a9?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Content Marketing", "Social Media", "SEO", "Email Marketing", "Events", "Analytics"],
    templates: [
      { title: "Social Media Calendar", description: "Plan weekly social media posts across all platforms to maintain consistent presence.", priority: "Medium", subcategory: "Social Media" },
      { title: "SEO Keyword Research", description: "Monthly analysis of keywords to target in content creation and website optimization.", priority: "High", subcategory: "SEO" },
      { title: "Content Strategy", description: "Brainstorm and plan content topics for blog posts, videos, and downloadable resources.", priority: "Medium", subcategory: "Content Marketing" },
      { title: "Email Newsletter", description: "Draft and schedule regular newsletters to keep subscribers engaged with company updates.", priority: "Low", subcategory: "Email Marketing" },
      { title: "Webinar Promotion", description: "Comprehensive promotion plan for upcoming webinars to maximize attendance.", priority: "Medium", subcategory: "Events" },
    ],
  },
  {
    categoryName: "HR",
    description: "Templates for employee onboarding, performance reviews, and HR operations to enhance your human resources management.",
    iconColor: "bg-green-700",
    imagePath: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Recruitment", "Onboarding", "Employee Relations", "Performance Management", "Training", "Compliance"],
    templates: [
      { title: "New Hire Onboarding", description: "Complete orientation process for new employees joining the company.", priority: "High", subcategory: "Onboarding" },
      { title: "Vacation Requests", description: "Track and manage annual leave requests from team members.", priority: "Low", subcategory: "Employee Relations" },
      { title: "Payroll Processing", description: "Monthly payroll tasks including approvals, adjustments, and reporting.", priority: "High", subcategory: "Compliance" },
      { title: "Performance Reviews", description: "Quarterly performance review templates and scheduling.", priority: "Medium", subcategory: "Performance Management" },
      { title: "Job Posting & Recruitment", description: "Process for creating and distributing job postings across platforms.", priority: "Medium", subcategory: "Recruitment" },
    ],
  },
  {
    categoryName: "Finance",
    description: "Templates for budget planning, expense tracking, and financial reporting to keep your finances organized and transparent.",
    iconColor: "bg-yellow-700",
    imagePath: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Accounting", "Budgeting", "Financial Planning", "Tax Management", "Compliance", "Treasury"],
    templates: [
      { title: "Budget Planning", description: "Annual budget preparation process including departmental input gathering.", priority: "High", subcategory: "Budgeting" },
      { title: "Invoice Processing", description: "Monthly invoice handling workflow from receipt to payment approval.", priority: "Low", subcategory: "Accounting" },
      { title: "Expense Reimbursements", description: "Process for tracking and approving employee expense reimbursements.", priority: "Medium", subcategory: "Accounting" },
      { title: "Financial Reporting", description: "Quarterly financial statement preparation and analysis.", priority: "High", subcategory: "Financial Planning" },
      { title: "Tax Preparation", description: "Gather documentation and prepare information needed for tax filings.", priority: "High", subcategory: "Tax Management" },
    ],
  },
  {
    categoryName: "IT",
    description: "Templates for system maintenance, security monitoring, and technical support to keep your IT infrastructure running smoothly.",
    iconColor: "bg-red-700",
    imagePath: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Infrastructure", "Security", "Support", "Development", "Data Management", "Compliance"],
    templates: [
      { title: "Server Maintenance", description: "Weekly schedule for server updates, backups, and performance checks.", priority: "High", subcategory: "Infrastructure" },
      { title: "Backup Verification", description: "Daily verification of system backups to ensure data integrity.", priority: "Low", subcategory: "Data Management" },
      { title: "Network Security Scan", description: "Monthly comprehensive scan of network vulnerabilities.", priority: "High", subcategory: "Security" },
      { title: "Software Updates", description: "Process for testing and deploying software updates across the organization.", priority: "Medium", subcategory: "Support" },
      { title: "Help Desk Triage", description: "Workflow for prioritizing and assigning incoming support tickets.", priority: "Low", subcategory: "Support" },
    ],
  },
  {
    categoryName: "Project Management",
    description: "Templates for planning, executing, and monitoring projects with task breakdowns, milestones, and progress tracking.",
    iconColor: "bg-indigo-700",
    imagePath: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    subcategories: ["Planning", "Execution", "Monitoring", "Agile", "Traditional", "Resource Management"],
    templates: [
      { title: "Project Kickoff", description: "Initial tasks to set up a new project including scope definition and team assignments.", priority: "High", subcategory: "Planning" },
      { title: "Sprint Planning", description: "Biweekly planning process for agile teams to define upcoming work.", priority: "Medium", subcategory: "Agile" },
      { title: "Client Reporting", description: "Regular progress updates and reporting templates for client communication.", priority: "Medium", subcategory: "Monitoring" },
      { title: "Risk Assessment", description: "Process for identifying and mitigating potential project risks.", priority: "High", subcategory: "Planning" },
      { title: "Project Closeout", description: "Final tasks for properly concluding a project and documenting learnings.", priority: "Low", subcategory: "Execution" },
    ],
  },
];