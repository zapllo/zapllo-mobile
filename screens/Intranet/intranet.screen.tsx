import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Clipboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Navbar from '~/components/navbar';
import ToastAlert from '~/components/ToastAlert';
import CustomDeleteModal from '~/components/CustomDeleteModal';
import InputContainer from '~/components/InputContainer';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';

interface Category {
  _id: string;
  name: string;
}

interface IntranetEntry {
  _id: string;
  linkUrl: string;
  description: string;
  linkName: string;
  category: {
    _id: string;
    name: string;
  };
}

const IntranetScreen: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [entries, setEntries] = useState<IntranetEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [focusedInput, setFocusedInput] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingEntry, setEditingEntry] = useState<IntranetEntry | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<IntranetEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalLinks: 0,
    categoryCounts: {} as Record<string, number>,
  });
  const [formData, setFormData] = useState({
    linkUrl: '',
    description: '',
    linkName: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (entries.length > 0 && categories.length > 0) {
      const categoryCounts: Record<string, number> = {};
      categories.forEach(cat => {
        categoryCounts[cat._id] = 0;
      });
      entries.forEach(entry => {
        if (entry.category && entry.category._id) {
          categoryCounts[entry.category._id] = (categoryCounts[entry.category._id] || 0) + 1;
        }
      });
      setStats({
        totalLinks: entries.length,
        categoryCounts,
      });
    }
  }, [entries, categories]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchEntries(), fetchCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${backend_Host}/intranet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_Host}/category/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!formData.linkUrl || !formData.linkName || !formData.category || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (editingEntry) {
        console.log('Updating entry with ID:', editingEntry._id);
        console.log('Update URL:', `${backend_Host}/intranet/${editingEntry._id}`);
        await axios.patch(`${backend_Host}/intranet`, {
          id: editingEntry._id,
          linkUrl: formData.linkUrl,
          description: formData.description,
          linkName: formData.linkName,
          category: formData.category,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToastMessage('Link updated successfully');
      } else {
        await axios.post(`${backend_Host}/intranet`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setToastMessage('Link added successfully');
      }
      setFormData({ linkUrl: '', description: '', linkName: '', category: '' });
      setEditingEntry(null);
      setIsModalOpen(false);
      setShowToast(true);
      await fetchEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.linkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || entry.category._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open link'));
  };

  const handleCopyLink = (url: string) => {
    Clipboard.setString(url);
    setToastMessage('Link copied to clipboard');
    setShowToast(true);
  };

  const handleEditEntry = (entry: IntranetEntry) => {
    console.log('Full entry object for edit:', JSON.stringify(entry, null, 2));
    setEditingEntry(entry);
    setFormData({
      linkUrl: entry.linkUrl,
      description: entry.description,
      linkName: entry.linkName,
      category: entry.category._id,
    });
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (entry: IntranetEntry) => {
    console.log('Full entry object:', JSON.stringify(entry, null, 2));
    setEntryToDelete(entry);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('Deleting entry with ID:', entryToDelete._id);
      console.log('Delete URL:', `${backend_Host}/intranet/${entryToDelete._id}`);
      await axios.delete(`${backend_Host}/intranet`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: entryToDelete._id }
      });
      setToastMessage('Link deleted successfully');
      setShowToast(true);
      await fetchEntries();
      setDeleteModalVisible(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      Alert.alert('Error', 'Failed to delete link');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setEntryToDelete(null);
  };

  const handleCategoryCardClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveTab('all');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar title="Link Manager" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#815BF5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Navbar title="Link Manager" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="globe-outline" size={28} color="#815BF5" />
            <Text style={styles.title}>Link Manager</Text>
          </View>
          <Text style={styles.subtitle}>Organize and manage all your important links</Text>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabsList}>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('all');
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={activeTab === 'all' ? ['#815BF5', '#FC8929'] : ['#05071E', '#05071E']}
                style={styles.tablet}
              >
                <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Links</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('stats');
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={activeTab === 'stats' ? ['#815BF5', '#FC8929'] : ['#05071E', '#05071E']}
                style={styles.tablet}
              >
                <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>Statistics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsModalOpen(true);
            }}
          >
            <LinearGradient
              colors={['#815BF5', '#ffdfc5']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {activeTab === 'all' ? (
          <>
            <View style={styles.searchContainer}>
              <LinearGradient
                colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
                style={styles.searchBox}
              >
                <Ionicons name="search" size={20} color="#787CA5" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search links..."
                  placeholderTextColor="#787CA5"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </LinearGradient>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              <TouchableOpacity 
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedCategory('');
                }}
              >
                <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category._id}
                  style={[styles.categoryChip, selectedCategory === category._id && styles.categoryChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(category._id);
                  }}
                >
                  <Text style={[styles.categoryText, selectedCategory === category._id && styles.categoryTextActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.linksContainer}>
              {filteredEntries.map(entry => (
                <View
                  key={entry._id}
                  style={[styles.linkCard, { backgroundColor: '#1A1D36' }]}
                >
                  <TouchableOpacity
                    style={styles.linkContent}
                    onPress={() => handleOpenLink(entry.linkUrl)}
                  >
                    <View style={styles.linkHeader}>
                      <View style={styles.linkIcon}>
                        <Ionicons name="link" size={16} color="#815BF5" />
                      </View>
                      <View style={styles.linkInfo}>
                        <Text style={styles.linkName}>{entry.linkName}</Text>
                        <Text style={styles.linkCategory}>{entry.category.name}</Text>
                      </View>
                      <Ionicons name="open-outline" size={16} color="#815BF5" />
                    </View>
                    {entry.description && (
                      <Text style={styles.linkDescription}>{entry.description}</Text>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.linkActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCopyLink(entry.linkUrl)}
                    >
                      <Ionicons name="copy-outline" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleEditEntry(entry);
                      }}
                    >
                      <Image source={require('../../assets/Tasks/addto.png')} style={styles.actionIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        handleDeleteEntry(entry);
                      }}
                    >
                      <Image source={require('../../assets/Tasks/deleteTwo.png')} style={styles.actionIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.statsContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('');
                setActiveTab('all');
              }}
            >
              <View
                style={[styles.statCard, { backgroundColor: '#1A1D36' }]}
              >
                <Text style={styles.statNumber}>{stats.totalLinks}</Text>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Total Links</Text>
                  <Text style={styles.statAction}>View All</Text>
                </View>
              </View>
            </TouchableOpacity>

            {categories.map(category => (
              <TouchableOpacity
                key={category._id}
                onPress={() => handleCategoryCardClick(category._id)}
              >
                <View
                  style={[styles.statCard, { backgroundColor: '#1A1D36' }]}
                >
                  <Text style={styles.statNumber}>{stats.categoryCounts[category._id] || 0}</Text>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>{category.name}</Text>
                    <Text style={styles.statAction}>View Links</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={isModalOpen}
        onBackdropPress={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
          setFormData({ linkUrl: '', description: '', linkName: '', category: '' });
        }}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEntry ? 'Edit Link' : 'Add New Link'}</Text>
              <TouchableOpacity onPress={() => {
                setIsModalOpen(false);
                setEditingEntry(null);
                setFormData({ linkUrl: '', description: '', linkName: '', category: '' });
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            <View style={styles.customInputContainer}>
              <InputContainer
                label="Link Name *"
                value={formData.linkName}
                onChangeText={(text) => setFormData(prev => ({...prev, linkName: text}))}
                passwordError={false}
                backgroundColor="#0A0D28"
              />
            </View>

            <View style={styles.customInputContainer}>
              <InputContainer
                label="URL *"
                value={formData.linkUrl}
                onChangeText={(text) => setFormData(prev => ({...prev, linkUrl: text}))}
                passwordError={false}
                backgroundColor="#0A0D28"
                keyboardType="url"
              />
            </View>

            <View style={styles.customInputContainer}>
              <InputContainer
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
                passwordError={false}
                backgroundColor="#0A0D28"
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            </View>

            <View style={styles.categoryGroup}>
              <Text style={styles.categoryLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category._id}
                    style={[styles.categoryOption, formData.category === category._id && styles.categoryOptionSelected]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFormData(prev => ({...prev, category: category._id}));
                    }}
                  >
                    <Text style={[styles.categoryOptionText, formData.category === category._id && styles.categoryOptionTextSelected]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalOpen(false);
                  setEditingEntry(null);
                  setFormData({ linkUrl: '', description: '', linkName: '', category: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
                <LinearGradient
                  colors={['#815BF5', '#a78bfa']}
                  style={styles.saveButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>{editingEntry ? 'Update Link' : 'Save Link'}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    
    <ToastAlert
      visible={showToast}
      type="success"
      title={toastMessage}
      onHide={() => setShowToast(false)}
    />
    
    <CustomDeleteModal
      visible={deleteModalVisible}
      title="Are you sure you want to"
      subtitle="delete this link?"
      itemName={entryToDelete?.linkName || ''}
      onCancel={cancelDelete}
      onConfirm={confirmDelete}
      isDeleting={isDeleting}
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: '#2A2D47',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#815BF5',
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  linksContainer: {
    paddingBottom: 20,
  },
  linkCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  linkContent: {
    padding: 16,
  },
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#815BF520',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  linkCategory: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  linkDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
    paddingTop: 10,
  },
  customInputContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabsList: {
    flexDirection: 'row',
    borderColor: '#676B93',
    borderWidth: 1,
    borderRadius: 9999,
    padding: 6,
    width: '70%',
  },
  tab: {
    width: '50%',
    alignItems: 'center',
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  tabText: {
    color: '#676B93',
    fontSize: 12,
   
  },
  activeTabText: {
    color: 'white',
    fontSize: 12,

  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statInfo: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  statAction: {
    color: '#815BF5',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categorySelector: {
    marginTop: 8,
  },
  categoryOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionSelected: {
    backgroundColor: '#815BF5',
  },
  categoryOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  categoryOptionTextSelected: {
    color: 'white',
  },
});

export default IntranetScreen;
