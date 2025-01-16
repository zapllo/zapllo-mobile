import axios from 'axios';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { backend_Host } from '~/config';
import * as DocumentPicker from 'expo-document-picker';

interface TaskDetailedComponentProps {
  title: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  category: string;
  task: any;
  taskId: any;
}

const TaskDetailedComponent: React.FC<TaskDetailedComponentProps> = ({
  title,
  dueDate,
  assignedTo,
  assignedBy,
  category,
  task,
  taskId,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [description, setDescription] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<(string | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMoveToProgress = () => {
    setShowMainModal(false);
    setShowProgressModal(true);
  };

  const handleFileSelect = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('Document Picker Result: ', result);

      if (result.canceled) {
        console.log('Document selection cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        // Update URIs in attachments state for the selected index
        setAttachments((prev) => {
          const updated = [...prev];
          updated[index] = uri;
          console.log('Updated Attachments URIs: ', updated);
          return updated;
        });

        // Update file names in fileNames state for the selected index
        setFileNames((prev) => {
          const updated = [...prev];
          updated[index] = name;
          console.log('Updated File Names: ', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    }
  };

  const updateTask = async () => {
    try {
      const payload = {
        id: taskId,
        status: 'InProgress',
        comment: description,
        userName: 'John Doe',
        fileUrl: attachments,
      };
      console.log('payyyy', payload);
      const response = await axios.patch(`${backend_Host}/tasks/update`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Task updated successfully:', response.data);
      setShowProgressModal(false);
      Alert.alert('Success', 'Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update the task.');
    }
  };

  console.log('>>>>>>>>>>>ppppp', task);

  return (
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <View className="mt-5 h-48 w-[95%] items-center gap-6 self-center rounded-3xl border border-[#37384B] p-4">
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ margin: 0, justifyContent: 'flex-end', marginTop: 10 }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver={false}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View className="mt-16 rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
              {/* title */}
              <View className=" mb-7 flex w-full flex-row items-center justify-between">
                <Text
                  className="text-xl font-semibold text-white"
                  style={{ fontFamily: 'LatoBold' }}>
                  {title}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Image
                    source={require('../../assets/commonAssets/cross.png')}
                    className="h-8 w-8"
                  />
                </TouchableOpacity>
              </View>

              {/* assigned by an assigned to */}
              <View className="mb-6 flex w-full flex-row items-center justify-start gap-32 ">
                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Assigned by</Text>
                  <Text className=" text-lg text-[#815BF5]" style={{ fontFamily: 'LatoBold' }}>
                    {assignedBy}
                  </Text>
                </View>

                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Assigned to</Text>
                  <Text className="text-lg text-[#D85570]" style={{ fontFamily: 'LatoBold' }}>
                    {assignedTo}
                  </Text>
                </View>
              </View>

              {/* created date */}
              <View className="mb-6 flex w-full items-start gap-5 ">
                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Created date</Text>
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    {moment(task?.createdAt).format('ddd, MMMM D - hh:mm A')}
                  </Text>
                </View>

                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Due date</Text>
                  <Text className="text-lg text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                    {moment(task?.dueDate).format('ddd, MMMM D - hh:mm A')}
                  </Text>
                </View>
              </View>

              {/* features */}
              <View className="mb-6 flex w-full flex-row items-center justify-start gap-32">
                <View className="flex gap-3">
                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Frequency</Text>
                    <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                      Once
                    </Text>
                  </View>

                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Category</Text>
                    <Text className="text-lg  text-white" style={{ fontFamily: 'LatoBold' }}>
                      {category}
                    </Text>
                  </View>
                </View>

                <View className="flex gap-3">
                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Status</Text>
                    <Text
                      className="mt-1 text-lg text-[#815BF5]"
                      style={{ fontFamily: 'LatoBold' }}>
                      {task?.status}
                    </Text>
                  </View>

                  <View className="mt-1 flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Priority</Text>
                    <Text className="text-lg text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                      {task?.priority}
                    </Text>
                  </View>
                </View>
              </View>

              {/*Description */}
              <View className=" mb-6 flex w-full flex-col gap-1">
                <Text className="text-xs text-[#787CA5]">Description</Text>
                <Text className="text-base text-white">{task?.description}</Text>
              </View>

              {/* line */}
              <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

              {/* links */}
              <View className="mb-6 flex flex-col gap-2">
                <View className="flex flex-row items-center justify-start gap-2">
                  <Image
                    source={require('../../assets/commonAssets/links.png')}
                    className="h-5 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Links</Text>
                </View>

                <View className="ml-6 gap-2">
                  {(task?.links).map((link, index) => (
                    <TouchableOpacity key={index} onPress={() => Linking.openURL(link)}>
                      <Text style={{ color: '#815BF5' }}>{link}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* file and image upload */}
              <View className="mb-6 flex w-full flex-col ">
                <View className=" flex w-full flex-row items-center gap-2">
                  <Image
                    source={require('../../assets/commonAssets/fileLogo.png')}
                    className="h-6 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Files</Text>
                </View>

                <View className=" flex w-full flex-row items-center gap-3 pl-5 pt-1">
                  <Image
                    source={require('../../assets/commonAssets/fileUploadContainer.png')}
                    className="h-24 w-24"
                  />
                  <Image
                    source={require('../../assets/commonAssets/fileUploadContainer.png')}
                    className="h-24 w-24"
                  />
                  <Image
                    source={require('../../assets/commonAssets/fileUploadContainer.png')}
                    className="h-24 w-24"
                  />
                </View>
              </View>

              {/* reminders */}
              <View className=" mb-6 w-full flex-col gap-2">
                <View className=" flex w-full flex-row items-center gap-2">
                  <Image
                    source={require('../../assets/commonAssets/reminders.png')}
                    className="h-6 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Reminders</Text>
                </View>
                <Text className=" text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                  Wed, December 25 - 12:13 PM
                </Text>
              </View>

              {/* line */}
              <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

              {/* Task updates */}
              <View className=" mb-6 w-full flex-col gap-2">
                <View className=" mb-6 flex w-full flex-row items-center gap-2">
                  <Image
                    source={require('../../assets/commonAssets/allTasks.png')}
                    className="h-6 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Task Updates</Text>
                </View>

                <View className="flex w-full flex-row items-center justify-between">
                  <View className=" items-center-start flex flex-row gap-2">
                    <View className="h-10 w-10 rounded-full bg-white"></View>
                    <View>
                      <Text className="text-lg text-white">{assignedBy}</Text>
                      <Text className="text-xs text-[#787CA5]">a moment ago</Text>
                    </View>
                  </View>

                  <TouchableOpacity className="mb-4 flex items-center rounded-xl bg-[#815BF5] p-2 pl-3 pr-3">
                    <Text className="text-[11px] text-white" style={{ fontFamily: 'LatoBold' }}>
                      In Progress
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* line */}
                <View className="mb-3 mt-3 h-0.5 w-full bg-[#37384B]"></View>

                <View className="flex w-full flex-row items-center justify-between">
                  <View className=" items-center-start flex flex-row gap-2">
                    <View className="h-10 w-10 rounded-full bg-white"></View>
                    <View>
                      <Text className="text-lg text-white">{assignedBy}</Text>
                      <Text className="text-xs text-[#787CA5]">a moment ago</Text>
                    </View>
                  </View>

                  <TouchableOpacity className="mb-4 flex items-center rounded-xl bg-[#007B5B] p-2 pl-3 pr-3">
                    <Text className="text-[11px] text-white" style={{ fontFamily: 'LatoBold' }}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* line */}
                <View className="mb-3 mt-3 h-0.5 w-full bg-[#37384B]"></View>

                <TouchableOpacity
                  onPress={() => setShowMainModal(true)}
                  className="mt-3 w-1/2 self-center rounded-lg bg-gray-700 p-3">
                  <Text className=" text-center font-medium text-white">Update task status</Text>
                </TouchableOpacity>
              </View>
              <Modal
                isVisible={showMainModal}
                onBackdropPress={null as any} // Prevent closing when clicking outside
                style={{ margin: 0, justifyContent: 'flex-end' }}
                animationIn="slideInUp"
                animationOut="slideOutDown">
                <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
                  <View className="mb-14 mt-2 flex w-full flex-row items-center justify-between">
                    <Text className="text-xl font-semibold text-white">Task Progress</Text>
                    <TouchableOpacity onPress={() => setShowMainModal(false)}>
                      <Image
                        source={require('~/assets/commonAssets/cross.png')}
                        className="h-8 w-8"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="flex flex-col gap-5">
                    <TouchableOpacity
                      onPress={() => {
                        handleMoveToProgress();
                      }}
                      className="items-center rounded-full bg-[#A914DD] p-4">
                      <Text className="text-base font-medium text-white">Move to Progress</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        handleMoveToProgress();
                      }}
                      className="items-center rounded-full bg-[#007B5B] p-4">
                      <Text className="text-base font-medium text-white">Move to Completed</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Modal
                isVisible={showProgressModal}
                onBackdropPress={null as any} // Prevent closing when clicking outside
                style={{ margin: 0, justifyContent: 'flex-end' }}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                useNativeDriver={false}>
                <View
                  className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20"
                  style={{ marginBottom: 20 }}>
                  <View className="mb-6 mt-2 flex w-full flex-row items-center justify-between">
                    <Text className="text-xl font-semibold text-white">In Progress</Text>
                    <TouchableOpacity onPress={() => setShowProgressModal(false)}>
                      <Image
                        source={require('~/assets/commonAssets/cross.png')}
                        className="h-8 w-8"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Description */}
                  <View
                    className="mb-8 rounded-2xl border border-[#37384B] pl-6 pr-6"
                    style={{ height: 150, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <TextInput
                      multiline
                      className="text-white"
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Description"
                      placeholderTextColor="#787CA5"
                      style={{
                        textAlignVertical: 'top',
                        paddingTop: 11,
                        width: '100%',
                        paddingBottom: 11,
                      }}
                    />
                  </View>
                  {/* file and image upload */}
                  <View className="w-full ">
                    <View className=" flex w-full flex-row items-center gap-2">
                      <Image
                        source={require('~/assets/commonAssets/fileLogo.png')}
                        className="h-6 w-5"
                      />
                      <Text className="text-sm text-[#787CA5]">Files</Text>
                    </View>

                    <View className=" flex w-full flex-row items-center justify-center gap-5 pl-5 pt-1">
                      {/* Upload file containers */}
                      {['0', '1', '2'].map((index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleFileSelect(Number(index))}
                          className="flex h-24 w-24 items-center justify-center rounded-lg border border-[#37384B]">
                          {/* If file URI exists, show the file name, else show the placeholder image */}
                          {attachments[Number(index)] ? (
                            <Image
                              source={{ uri: attachments[Number(index)] }}
                              className="h-24 w-24 rounded-lg"
                            />
                          ) : (
                            <Image
                              source={require('~/assets/commonAssets/fileUploadContainer.png')}
                              className="h-24 w-24"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={updateTask}
                    className=" mt-10 h-16 w-full items-center justify-center rounded-full bg-[#37384B]">
                    <Text className=" text-xl text-white">Update Task</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </View>
          </ScrollView>
        </Modal>

        <View className="flex w-full flex-row items-center justify-between">
          <Text className="font-semibold text-white " style={{ fontFamily: 'LatoBold' }}>
            {title}
          </Text>
          <Image source={require('../../assets/commonAssets/threeDot.png')} className="h-6 w-5" />
        </View>

        <View className="flex w-full flex-row items-start gap-20">
          <View className="flex gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Due Date</Text>
              <Text className="text-[#EF4444] " style={{ fontFamily: 'LatoBold' }}>
                {dueDate}
              </Text>
            </View>

            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Assigned to</Text>
              <Text className="text-[#D85570]" style={{ fontFamily: 'LatoBold' }}>
                {assignedTo}
              </Text>
            </View>
          </View>

          <View className="flex gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Assigned by</Text>
              <Text className="text-[#815BF5] " style={{ fontFamily: 'LatoBold' }}>
                {assignedBy}
              </Text>
            </View>

            <View className="flex flex-col ">
              <Text className="text-xs text-[#787CA5]">Category</Text>
              <Text className="text-[#FDB314]" style={{ fontFamily: 'LatoBold' }}>
                {category}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render the main modal content
  const renderMainModalContent = () => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20 mt-16">
        <View className="mb-7 flex w-full flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white" style={{ fontFamily: "LatoBold" }}>{title}</Text>
          <TouchableOpacity onPress={handleMainModalToggle}>
            <Image
              source={require('../../assets/commonAssets/cross.png')}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        {/* Task Details Section */}
        <View className="mb-6 flex w-full flex-row items-center justify-start gap-32">
          <View className="flex flex-col">
            <Text className="text-xs text-[#787CA5]">Assigned by</Text>
            <Text className="text-[#815BF5] text-lg" style={{ fontFamily: "LatoBold" }}>{assignedBy}</Text>
          </View>

          <View className="flex flex-col">
            <Text className="text-xs text-[#787CA5]">Assigned to</Text>
            <Text className="text-[#D85570] text-lg" style={{ fontFamily: "LatoBold" }}>{assignedTo}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View className="mb-6 flex w-full items-start gap-5">
          <View className="flex flex-col">
            <Text className="text-xs text-[#787CA5]">Created date</Text>
            <Text className="text-lg text-white" style={{ fontFamily: "LatoBold" }}>
              {moment(task?.createdAt).format('ddd, MMMM D - hh:mm A')}
            </Text>
          </View>

          <View className="flex flex-col">
            <Text className="text-xs text-[#787CA5]">Due date</Text>
            <Text className="text-lg text-[#EF4444]" style={{ fontFamily: "LatoBold" }}>
              {moment(task?.dueDate).format('ddd, MMMM D - hh:mm A')}
            </Text>
          </View>
        </View>

        {/* Task Status Section */}
        <View className="mb-6 flex w-full flex-row items-center justify-start gap-32">
          <View className="flex gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Frequency</Text>
              <Text className="text-lg text-white" style={{ fontFamily: "LatoBold" }}>Once</Text>
            </View>

            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Category</Text>
              <Text className="text-white text-lg" style={{ fontFamily: "LatoBold" }}>{category}</Text>
            </View>
          </View>

          <View className="flex gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Status</Text>
              <Text className="mt-1 text-[#815BF5] text-lg" style={{ fontFamily: "LatoBold" }}>{task?.status}</Text>
            </View>

            <View className="mt-1 flex flex-col">
              <Text className="text-xs text-[#787CA5]">Priority</Text>
              <Text className="text-[#EF4444] text-lg" style={{ fontFamily: "LatoBold" }}>{task?.priority}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View className="mb-6 flex w-full flex-col gap-1">
          <Text className="text-xs text-[#787CA5]">Description</Text>
          <Text className="text-base text-white">{task?.description}</Text>
        </View>

        <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]" />

        {/* Links Section */}
        <View className="mb-6 flex flex-col gap-2">
          <View className="flex flex-row items-center justify-start gap-2">
            <Image
              source={require('../../assets/commonAssets/links.png')}
              className="h-5 w-5"
            />
            <Text className="text-xs text-[#787CA5]">Links</Text>
          </View>

          <View className="ml-6 gap-2">
            {task?.links.map((link, index) => (
              <TouchableOpacity key={index} onPress={() => Linking.openURL(link)}>
                <Text style={{ color: '#815BF5' }}>{link}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Files Section */}
        <View className="mb-6 flex w-full flex-col">
          <View className="flex w-full flex-row items-center gap-2">
            <Image
              source={require('../../assets/commonAssets/fileLogo.png')}
              className="h-6 w-5"
            />
            <Text className="text-xs text-[#787CA5]">Files</Text>
          </View>

          <View className="flex w-full flex-row items-center gap-3 pl-5 pt-1">
            {[1, 2, 3].map((_, index) => (
              <Image
                key={index}
                source={require('../../assets/commonAssets/fileUploadContainer.png')}
                className="h-24 w-24"
              />
            ))}
          </View>
        </View>

        {/* Reminders Section */}
        <View className="mb-6 w-full flex-col gap-2">
          <View className="flex w-full flex-row items-center gap-2">
            <Image
              source={require('../../assets/commonAssets/reminders.png')}
              className="h-6 w-5"
            />
            <Text className="text-xs text-[#787CA5]">Reminders</Text>
          </View>
          <Text className="text-lg text-white" style={{ fontFamily: "LatoBold" }}>
            Wed, December 25 - 12:13 PM
          </Text>
        </View>

        <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]" />

        {/* Task Updates Section */}
        <View className="mb-6 w-full flex-col gap-2">
          <View className="mb-6 flex w-full flex-row items-center gap-2">
            <Image
              source={require('../../assets/commonAssets/allTasks.png')}
              className="h-6 w-5"
            />
            <Text className="text-xs text-[#787CA5]">Task Updates</Text>
          </View>

          {/* Update Items */}
          {[
            { status: 'In Progress', bgColor: '#815BF5' },
            { status: 'Completed', bgColor: '#007B5B' }
          ].map((update, index) => (
            <React.Fragment key={index}>
              <View className="flex w-full flex-row items-center justify-between">
                <View className="items-center-start flex flex-row gap-2">
                  <View className="h-10 w-10 rounded-full bg-white" />
                  <View>
                    <Text className="text-lg text-white">{assignedBy}</Text>
                    <Text className="text-xs text-[#787CA5]">a moment ago</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="mb-4 flex items-center rounded-xl p-2 pl-3 pr-3"
                  style={{ backgroundColor: update.bgColor }}>
                  <Text className="text-[11px] text-white" style={{ fontFamily: "LatoBold" }}>
                    {update.status}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mb-3 mt-3 h-0.5 w-full bg-[#37384B]" />
            </React.Fragment>
          ))}
        </View>

        {/* Open Nested Modal Button */}
        <TouchableOpacity 
          onPress={handleOpenNestedModal}
          className="mt-4 bg-[#815BF5] p-3 rounded-xl">
          <Text className="text-white text-center" style={{ fontFamily: "LatoBold" }}>
            Open Nested Modal
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View>
      {renderTaskCard()}

      {/* Main Modal */}
      <Modal
        isVisible={isMainModalVisible}
        onBackdropPress={handleMainModalClose}
        style={{ margin: 0, justifyContent: 'flex-end', marginTop: 10 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={false}
        propagateSwipe={true}>
        {renderMainModalContent()}
      </Modal>

      {/* Nested Modal */}
      <Modal
        isVisible={isNestedModalVisible}  // Nested modal visibility is independent
        onBackdropPress={handleNestedModalClose}  // Close nested modal on backdrop press
        onBackButtonPress={handleNestedModalClose} // Close nested modal on hardware back button
        style={{ margin: 0, justifyContent: 'center' }}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver={false}
        propagateSwipe={true}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Nested Modal</Text>
          <Text>This is the content of the nested modal.</Text>
          <TouchableOpacity onPress={handleNestedModalClose} style={{ marginTop: 16 }}>
            <Text style={{ color: '#815BF5', textAlign: 'center', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default TaskDetailedComponent;