import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import CheckboxTwo from '~/components/CheckBoxTwo';
import GradientButton from '~/components/GradientButton';

interface FilterModalProps {
  isVisible: boolean;
  toggleModal: () => void;
  categories: Array<{ _id: string; name: string }>;
  users: Array<{ _id: string; firstName: string; lastName: string }>;
  frequencyOptions: Array<{ value: string; label: string }>;
  priorityOptions: Array<{ value: string; label: string }>;
  applyFilter: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  toggleModal,
  categories,
  users,
  frequencyOptions,
  priorityOptions,
  applyFilter,
}) => {
  const [activeFilter, setActiveFilter] = useState('Category');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [taskDescription, setTaskDescription] = useState('');

  const getFilterBackgroundColor = (filter: string) =>
    activeFilter === filter ? '#1A1C3D' : 'transparent';

  const handleCategorySelection = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={toggleModal}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View className="flex flex-col items-center rounded-t-3xl bg-[#0A0D28] pb-16">
        <View className="flex w-full flex-row items-center justify-between px-6 py-5">
          <View>
            <Text className="text-2xl font-bold text-white" style={{ fontFamily: 'LatoBold' }}>
              Filters
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategories([]);
              setSelectedAssignees([]);
              setSelectedFrequencies([]);
              setSelectedPriorities([]);
            }}>
            <Text className="text-lg text-white" style={{ fontFamily: 'Lato-Regular' }}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6 flex w-full flex-row border border-y-[#37384B]">
          <View className="w-[40%] border-r border-r-[#37384B] pb-20">
            <TouchableOpacity
              onPress={() => setActiveFilter('Category')}
              className="h-14 w-full items-start"
              style={{ backgroundColor: getFilterBackgroundColor('Category') }}>
              <Text className="h-full p-4 px-6 text-white">Category</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-14 w-full items-start border-b border-b-[#37384B]"
              style={{ backgroundColor: getFilterBackgroundColor('AssignedTo') }}
              onPress={() => setActiveFilter('AssignedTo')}>
              <Text className="h-full p-4 px-6 text-white">Assigned to</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-14 w-full items-start border-b border-b-[#37384B]"
              style={{ backgroundColor: getFilterBackgroundColor('Frequency') }}
              onPress={() => setActiveFilter('Frequency')}>
              <Text className="h-full p-4 px-6 text-white">Frequency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-14 w-full items-start border-b border-b-[#37384B]"
              style={{ backgroundColor: getFilterBackgroundColor('Priority') }}
              onPress={() => setActiveFilter('Priority')}>
              <Text className="h-full p-4 px-6 text-white">Priority</Text>
            </TouchableOpacity>
          </View>

          <View className="flex w-[60%] flex-col gap-6 p-4">
            <View style={[styles.input, { height: 57, borderRadius: 16 }]}>
              <Image
                className="ml-2 mr-2 h-4 w-4"
                source={require('../../assets/Tasks/search.png')}
              />
              <TextInput
                style={[styles.inputSome, { width: '85%' }]}
                value={taskDescription}
                onChangeText={(value) => setTaskDescription(value)}
                placeholder="Search Category"
                placeholderTextColor="#787CA5"></TextInput>
            </View>

            {activeFilter === 'Category' &&
              categories.map((category) => (
                <View key={category._id} className="flex w-full flex-row items-center gap-3">
                  <CheckboxTwo
                    isChecked={selectedCategories.includes(category._id)}
                    onPress={() => handleCategorySelection(category._id)}
                  />
                  <Text className="text-lg text-white">{category.name}</Text>
                </View>
              ))}

            {activeFilter === 'AssignedTo' &&
              users.map((user) => (
                <View key={user._id} className="flex w-full flex-row items-center gap-3">
                  <CheckboxTwo
                    isChecked={selectedAssignees.includes(user._id)}
                    onPress={() =>
                      setSelectedAssignees((prev) =>
                        prev.includes(user._id)
                          ? prev.filter((id) => id !== user._id)
                          : [...prev, user._id]
                      )
                    }
                  />
                  <Text className="text-lg text-white">{`${user.firstName} ${user.lastName}`}</Text>
                </View>
              ))}

            {activeFilter === 'Frequency' &&
              frequencyOptions.map((freq) => (
                <View key={freq.value} className="flex w-full flex-row items-center gap-3">
                  <CheckboxTwo
                    isChecked={selectedFrequencies.includes(freq.value)}
                    onPress={() =>
                      setSelectedFrequencies((prev) =>
                        prev.includes(freq.value)
                          ? prev.filter((f) => f !== freq.value)
                          : [...prev, freq.value]
                      )
                    }
                  />
                  <Text className="text-lg text-white">{freq.label}</Text>
                </View>
              ))}

            {activeFilter === 'Priority' &&
              priorityOptions.map((priority) => (
                <View key={priority.value} className="flex w-full flex-row items-center gap-3">
                  <CheckboxTwo
                    isChecked={selectedPriorities.includes(priority.value)}
                    onPress={() =>
                      setSelectedPriorities((prev) =>
                        prev.includes(priority.value)
                          ? prev.filter((p) => p !== priority.value)
                          : [...prev, priority.value]
                      )
                    }
                  />
                  <Text className="text-lg text-white">{priority.label}</Text>
                </View>
              ))}
          </View>
        </View>

        <GradientButton title="Apply Filter          " onPress={applyFilter} imageSource={''} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1C3D',
    paddingHorizontal: 10,
  },
  inputSome: {
    color: 'white',
  },
});

export default FilterModal;