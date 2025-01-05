// import React, { useState } from "react";
// import { Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
// import { Dropdown } from 'react-native-element-dropdown';
// import { router,useRouter, useLocalSearchParams } from "expo-router";
// import { GradientText } from "~/components/GradientText";
// import InputContainer from "~/components/InputContainer";
// import axios from "axios"

// export default function SignUpTwoScreen() {
 
//     const [buttonSpinner, setButtonSpinner] = useState(false);
//     const [companyName, setCompanyName] = useState("");
//     const [description, setDescription] = useState("");
//     const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
//     const [isTeamSizeDropdownOpen, setIsTeamSizeDropdownOpen] = useState(false);
//     const [selectedIndustry, setSelectedIndustry] = useState(null); // Selected value for Industry dropdown
//     const [selectedTeamSize, setSelectedTeamSize] = useState(null); // Selected value for Team Size dropdown
//     const router = useRouter();
//     const { data } = useLocalSearchParams(); // Use useLocalSearchParams instead
//     const initialData = data ? JSON.parse(data as any ) : {}; // Parse received data

//     const [userData, setUserData] = useState({
//         ...initialData, 
//     });

//     const categoriesData = [
//         { id: 1, item: "Sales", selected: false },
//         { id: 2, item: "Marketing", selected: false },
//         { id: 3, item: "HR/Admin", selected: false },
//         { id: 4, item: "General", selected: false },
//         { id: 5, item: "Operations", selected: false },
//         { id: 6, item: "Automation", selected: false },
//         { id: 7, item: "Admin", selected: false },
//         { id: 8, item: "UI/UX", selected: false },
//     ];
//     const [selectedItem, setSelectedItem] = useState(categoriesData);

//     const onSelect = (item: any) => {
//         const newItem = selectedItem.map((val) => {
//             if (val.id === item.id) {
//                 return { ...val, selected: !val.selected }; // Toggle selection
//             } else {
//                 return val;
//             }
//         });
//         setSelectedItem(newItem);
//     };

//     const industryData = [
//         { label: 'Retail/E-Commerce', value: 'Retail/E-Commerce' },
//         { label: 'Technology', value: 'Technology' },
//         { label: 'Service Provider', value: 'Service Provider' },
//         { label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)', value: 'Healthcare(Doctors/Clinics/Physicians/Hospital)' },
//         { label: 'Logistics', value: 'Logistics' },
//         { label: 'Financial Consultants', value: 'Financial Consultants' },
//         { label: 'Trading', value: 'Trading' },
//         { label: 'Education', value: 'Education' },
//         { label: 'Manufacturing', value: 'Manufacturing' },
//         { label: 'Real Estate/Construction/Interior/Architects', value: 'Real Estate/Construction/Interior/Architects' },
//         { label: 'Others', value: 'Others' },
//     ];

//     const teamsData = [
//         { label: '1-10', value: '1-10', },
//         { label: '11-20', value: '11-20' },
//         { label: '21-30', value: '21-30' },
//         { label: '31-50', value: '31-50' },
//         { label: '51+', value: '51+' },
//     ];


//     const isFormValid = 
//     companyName.trim() !== "" && 
//     selectedIndustry !== null && 
//     selectedTeamSize !== null;




//     const renderIndustryItem = (item: any) => {
//         const isSelected = item.value === selectedIndustry;

//         return (
//             <TouchableOpacity
//                 style={[
//                     styles.itemStyle,
//                     isSelected && styles.selectedDropdownItemStyle, // Apply selected item style
//                 ]}
//                 onPress={() => setSelectedIndustry(item.value)} // Update selected item
//             >
//                 <Text
//                     style={[
//                         styles.itemTextStyle,
//                         isSelected && styles.selectedTextStyle, // Apply selected text style
//                     ]}
//                 >
//                     {item.label}
//                 </Text>
//             </TouchableOpacity>
//         );
//     };

//     const renderTeamSizeItem = (item: any) => {
//         const isSelected = item.value === selectedTeamSize;

//         return (
//             <TouchableOpacity
//                 style={[
//                     styles.itemStyle,
//                     isSelected && styles.selectedDropdownItemStyle, // Apply selected item style
//                 ]}
//                 onPress={() => setSelectedTeamSize(item.value)} // Update selected item
//             >
//                 <Text
//                     style={[
//                         styles.itemTextStyle,
//                         isSelected && styles.selectedTextStyle, // Apply selected text style
//                     ]}
//                 >
//                     {item.label}
//                 </Text>
//             </TouchableOpacity>
//         );
//     };


//     const handleSignUp = async () => {
//         const categories = selectedItem
//             .filter((item) => item.selected) // Only include selected categories
//             .map((item) => item.item);
    
//         const payload = {
//             ...userData, 
//             companyName, 
//             industry: selectedIndustry,
//             teamSize: selectedTeamSize,
//             description,
//             categories, 
//         };
    
//         console.log("Payload to send:", payload); // Debugging: Check the payload
    
//         await axios
//             .post("https://zapllo.com/api/users/signup", payload)
//             .then((res) => {
//                 console.log("Response from server:", res.data);
//                 alert("Sign-up successful!");
//                 // router.push("/success"); // Navigate to success page
//             })
//             .catch((err) => {
//                 console.error("Error during sign-up:", err);
//                 alert("An error occurred. Please try again.");
//             });
//     };
    
    


//     return (
//         <SafeAreaView className="bg-[#05071E] h-full w-full  items-center ">
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === "ios" ? "padding" : "height"}
//                className="flex-1 w-full"
//             >
//                 <ScrollView
//                     contentContainerStyle={{ flexGrow: 1 }}
//                     showsVerticalScrollIndicator={false}
//                     showsHorizontalScrollIndicator={false}
//                 >
//                     <View className=" h-full w-full items-center">

//                         {/* starting banner */}
//                         <View className="flex-row w-full items-center justify-center mb-9 mt-[4.6rem]">
//                             <Image className="w-12 h-9" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
//                             <Text className="text-white font-semibold text-xl ml-2 mt-2">Zapllo Teams</Text>
//                         </View>

//                         {/* middle banner */}
//                         <View className="flex items-center justify-center gap-6 w-full mb-2">
//                             <Text className="text-white font-semibold text-2xl">Create Your Workspace</Text>
//                             <Text className="text-white font-light ">Let's get started by filling out the form below.</Text>
//                         </View>

//                         {/* Company Name */}
//                         <InputContainer
//                             label="Company Name"
//                             value={companyName}
//                             onChangeText={(value) => setCompanyName(value)}
//                             placeholder="Company Name"
                            
//                         />

//                     {/* drop down Business Industry names */}
//                         {/* drop down Business Industry names */}
//                         <View style={styles.input}>
//                             <Text style={[styles.baseName, { fontFamily: "Nunito_400Regular" }]}>Business Industry</Text>
//                         <Dropdown
//                             style={styles.dropdown}
//                             placeholderStyle={styles.placeholderStyle}
//                             selectedTextStyle={styles.selectedTextStyle}
//                             inputSearchStyle={styles.inputSearchStyle}
//                             renderItem={renderIndustryItem} // Render Industry dropdown items
//                             data={industryData}
//                             maxHeight={200}
//                             labelField="label"
//                             valueField="value"
//                             placeholder="Select an Industry"
//                             value={selectedIndustry} // Bind selected value
//                             onChange={(item: any) => setSelectedIndustry(item.value)} // Update selected value
//                             onFocus={() => setIsIndustryDropdownOpen(true)} // Set dropdown as open
//                             onBlur={() => setIsIndustryDropdownOpen(false)} // Set dropdown as closed
//                             iconStyle={{
//                                 transform: [{ rotate: isIndustryDropdownOpen ? "180deg" : "0deg" }],
//                             }} // Rotate the icon dynamically
//                             containerStyle={styles.dropdownMenu}
//                         />

//                         </View>

//                         {/* drop down team size names */}
//                         <View style={styles.input}>
//                             <Text style={[styles.baseName, { fontFamily: "Nunito_400Regular" }]}>Team Size</Text>
//                             <Dropdown
//                             style={styles.dropdown}
//                             placeholderStyle={styles.placeholderStyle}
//                             selectedTextStyle={styles.selectedTextStyle}
//                             inputSearchStyle={styles.inputSearchStyle}
//                             renderItem={renderTeamSizeItem} // Render Team Size dropdown items
//                             data={teamsData}
//                             maxHeight={200}
//                             labelField="label"
//                             valueField="value"
//                             placeholder="Select a Team Size"
//                             value={selectedTeamSize} // Bind selected value
//                             onChange={(item: any) => setSelectedTeamSize(item.value)} // Update selected value
//                             onFocus={() => setIsTeamSizeDropdownOpen(true)} // Set dropdown as open
//                             onBlur={() => setIsTeamSizeDropdownOpen(false)} // Set dropdown as closed
//                             iconStyle={{
//                                 transform: [{ rotate: isTeamSizeDropdownOpen ? "180deg" : "0deg" }],
//                             }} // Rotate the icon dynamically
//                             containerStyle={styles.dropdownMenu}
//                         />

//                         </View>
//                         {/* Description */}
//                         <View style={[styles.input, { height: 100, justifyContent: "flex-start", alignItems: "flex-start" }]}>
//                         <TextInput
//                             multiline
                            
//                             style={[styles.inputSome,{ textAlignVertical: 'top', paddingTop: 10,width:"100%" }]}
//                             value={description}
//                             onChangeText={(value) => setDescription(value)}
//                             placeholder="Description"
//                             placeholderTextColor="#787CA5"
//                         ></TextInput>
//                         </View>

//                         <View className="flex items-start gap-3 mt-6 mb-6 w-[90%]">
//                             <Text className="text-white mt-1 font-light">Select the categories that are relevant to your business</Text>
//                         </View>

//                         {/* Render buttons without scrolling */}
//                         <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', width: '90%',gap:5,alignItems:"flex-start" }}>
//     {selectedItem.map((item) => (
//         <TouchableOpacity
//             key={item.id}
//             style={{
//                 width: 69, // Fixed width in pixels
//                 height: 30, // Fixed height in pixels
//                  // Spacing between buttons
//                 borderRadius: 40, // Rounded corners
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 backgroundColor: item.selected ? '#815BF5' : '#37384B',
//                 marginRight:3,
//                 marginTop:3,
//                 padding:3,
//                 minWidth:65,
//                 maxWidth:69
//             }}
//             onPress={() => onSelect(item)}
//         >
//             <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{item.item}</Text>
//         </TouchableOpacity>
//     ))}
// </View>



//                         <View className="flex items-start w-[90%] mt-4  mb-4">
//                             <Text className="text-white  font-light text-[12px] ">Don't worry you can add more later in the Settings panel</Text>
//                         </View>

//                         {/* button sign up */}
//                         <TouchableOpacity
//                             className={`p-2.5 mt-3 rounded-full w-[89%] h-[3.6rem] items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
//                             onPress={handleSignUp}
                            
//                         >
//                             {
//                                 buttonSpinner ? (
//                                     <ActivityIndicator size="small" color={"white"} />
//                                 ) : (
//                                     <Text className="text-white text-center ">
//                                         Sign Up
//                                     </Text>
//                                 )
//                             }
//                         </TouchableOpacity>

//                         {/* go to the login page */}
//                         <View className="flex-row items-center justify-end mt-4 mb-10 ">
//                             <Text className="text-white font-light mr-1">Already a </Text>
//                             <GradientText text="Zapllonian" />
//                             <Text className="text-white mr-1">? </Text>
//                             <TouchableOpacity onPress={() => router.push("/(routes)/login" as any)}>
//                                 <Text className="text-white font-semibold">Log In Here</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     selectedDropdownItemStyle: {
//         backgroundColor: "#4e5278", // Background color for selected item
//     },


//   input:{
//     borderWidth: 1,
//     borderColor: '#37384B',
//     padding: 10,
//     marginTop: 25,
//     borderRadius: 35,
//     width:"90%",
//     height:57,
//     position:"relative",
    
//   },
//   baseName:{
//     color:"#787CA5",
//     position:"absolute",
//     top:-9,
//     left:25,
//     backgroundColor:"#05071E",
//     paddingRight:5,
//     paddingLeft:5,
//     fontSize:10,
//     fontWeight:200
//   },
//   inputSome:{
//     flex:1,
//     padding:8,
//     color:"#787CA5",
//     fontSize:12
//   },

//     dropdown: {
//         position:"absolute",
//         width:"100%",
//         height:50,
//     },
//     itemStyle: {
//         padding: 15,
//         borderBottomColor:"#37384B",
//         borderBottomWidth:1,
        
//     },
//     itemTextStyle: {
//         color: '#787CA5',
//     },
//     selectedItemStyle: {
//         backgroundColor: '#4e5278',

//     },

//     placeholderStyle: {
//       fontSize: 13,
//       color:"#787CA5",
//       fontWeight:300,
//       paddingLeft:22,
//     },
//     selectedTextStyle: {
//       fontSize: 13,
//       color:"#787CA5",
//       fontWeight:300,
//       paddingLeft:22,
//     },
//     iconStyle: {
//       width: 20,
//       height: 20,
//     },
//     inputSearchStyle: {
//       height: 40,
//       fontSize: 16,
//       marginRight: 5,
//       borderColor:"white"
//     },
//     dropdownMenu: {
//         backgroundColor: "#05071E", 
//         borderColor: "#37384B", 
//         borderWidth: 1, 
//         borderBottomEndRadius: 15, 
//         borderBottomStartRadius:15,  
//         margin:8,
         
//     },
//     dropdownMenuTwo: {
//         backgroundColor: "#05071E", 
//         borderColor: "#37384B", 
//         borderWidth: 1, 
//         borderBottomEndRadius: 15, 
//         borderBottomStartRadius:15,
//         margin:8,
//     },


// });


// const styles = StyleSheet.create({
//   title: {
//     color: '#fff',
//     fontSize: 23,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//     fontFamily: 'PathwayExtreme-Bold',
//   },
//   subtitle: {
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   input: {
//     marginBottom: 15,
//     backgroundColor: '#05071E',
//   },
//   dropdownView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#05071E',
//   },
//   categoryTitle: {
//     color: '#fff',
//     fontSize: 17,
//     marginBottom: 10,
//     fontWeight: '600',
//   },
//   categoriesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center', // Align boxes to the start
//     gap: 8, // Adds consistent spacing between boxes
//   },
//   categoryChip: {
//     backgroundColor: '#37384B',
//     borderRadius: 20, // Higher radius for a pill-shaped look
//     marginBottom: 8, // Spacing for wrapping
//   },
//   selectedCategoryChip: {
//     backgroundColor: '#815BF5',
//     borderRadius: 20,
//     marginBottom: 8,
//   },
//   categoryText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#FF6F61',
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   footerText: {
//     color: '#FFFFFF',
//     textAlign: 'center',
//     fontSize: 12,
//     marginTop: 5,
//     marginBottom: 20,
//     fontWeight: '400',
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import Material Community Icons
import Navbar from "~/components/navbar";
import CustomDropdown from "~/components/customDropDown";
import { NavigationProp } from "@react-navigation/core"; // Type for navigation
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { DashboardStackParamList } from "./DashboardStack";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { useFocusEffect } from "expo-router";
import axios from "axios";
import { backend_Host } from "~/config";

interface Task {
  _id: string;
  status: string;
  dueDate: string;
  completionDate: string | null;
  title: string;
  description: string;
  assignedUser: { firstName: string, lastName: string }[];
}

type TaskStatus = "Overdue" | "Pending" | "InProgress" | "Completed" | "In Time" | "Delayed";

interface TaskStatusCounts {
  Overdue: number;
  Pending: number;
  InProgress: number;
  Completed: number;
  "In Time": number;
  Delayed: number;
}

const daysData = [
  { label: "Today", value: "Overdue" },
  { label: "Yesterday", value: "Yesterday" },
  { label: "This Week", value: "This Week" },
  { label: "Last Week", value: "Last Week" },
  { label: "Next Week", value: "Next Week" },
  { label: "This Month", value: "This Month" },
  { label: "Next Month", value: "Next Month" },
  { label: "This Year", value: "This Year" },
  { label: "All Time", value: "All Time" },
  { label: "Custom", value: "Custom" },
];

export default function DashboardScreen() {
  const { isLoggedIn, token } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]); // Ensuring tasks is always an array
  const [taskCounts, setTaskCounts] = useState<TaskStatusCounts>({
    Overdue: 0,
    Pending: 0,
    InProgress: 0,
    Completed: 0,
    "In Time": 0,
    Delayed: 0,
  });

  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  const countStatuses = (tasks: Task[]): TaskStatusCounts => {
    return tasks.reduce((counts, task) => {
      const dueDate = new Date(task.dueDate);
      const completionDate = task.completionDate ? new Date(task.completionDate) : null;
      const now = new Date();

      // Count overdue tasks
      if (dueDate < now && task.status !== "Completed") {
        counts["Overdue"] = (counts["Overdue"] || 0) + 1;
      }
      // Count completed tasks as either "In Time" or "Delayed"
      if (task.status === "Completed" && completionDate) {
        if (completionDate <= dueDate) {
          counts["In Time"] = (counts["In Time"] || 0) + 1;
        } else {
          counts["Delayed"] = (counts["Delayed"] || 0) + 1;
        }
      }
      // Count task status
      counts[task.status as TaskStatus] = (counts[task.status as TaskStatus] || 0) + 1;

      return counts;
    }, {
      Overdue: 0,
      Pending: 0,
      InProgress: 0,
      Completed: 0,
      "In Time": 0,
      Delayed: 0
    } as TaskStatusCounts); // Explicitly type the initial counts
  };

  const getInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName[0].toUpperCase();
    const lastInitial = lastName[0].toUpperCase();
    return firstInitial + lastInitial;
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTasks = async () => {
        try {
          const response = await axios.get(`${backend_Host}/tasks/organization`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const tasksData = Array.isArray(response.data) ? response.data : []; // Ensure tasks is always an array
          console.log('Tasks fetched:', tasksData); // Log response data to verify structure
          setTasks(tasksData);
          setTaskCounts(countStatuses(tasksData)); // Update task counts
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };

      fetchTasks();
    }, [token])
  );

  return (
    <SafeAreaView className="flex-1 bg-primary h-full">
      <Navbar title="Dashboard" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Dropdown */}
            <View className="items-center w-full flex mt-4 mb-3">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Content */}
            <View className="flex gap-2.5 flex-col h-full items-center w-full p-4.2 pt-1 mb-32">
              {/* Display Task Count by Status */}
              {["Completed", "Pending", "InProgress", "In Time", "Delayed"].map((status) => (
                <View className="flex-row flex items-start gap-2.5 justify-center w-[90%] h-[14rem]" key={status}>
                  <View className={`w-1/2 h-full ${status === "Completed" ? 'bg-[#FC842C]' : status === "Delayed" ? 'bg-[#DE7560]' : 'bg-[#FDB314]'} rounded-3xl p-5 flex flex-col`}>
                    <View className="flex items-start ">
                      <Text className="text-white font-medium">{`${status} Tasks`}</Text>
                      <Text className="text-white font-semibold" style={{fontSize:34}}>
                        {taskCounts[status as keyof TaskStatusCounts]}
                      </Text>
                      <Text className="text-xs text-white pt-2 w-[40vw]">{`22-12-2024 to 28-12-2024`}</Text>
                    </View>
                    <View className="flex items-start flex-row mt-3">
                      <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                        {tasks
                          .filter((task) => task.status === status)
                          .slice(0, 3) // Show only first 3 users
                          .map((task, index) => (
                            <View key={index} className="bg-red-600 w-9 h-9 rounded-full border border-[#FC842C] flex justify-center items-center">
                              <Text className="text-white font-semibold text-sm">{getInitials(task.assignedUser.firstName, task.assignedUser.lastName)}</Text>
                            </View>
                        ))}
                        <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full border border-[#FC842C]">
                          <Text className="text-black text-center text-sm font-semibold">+{taskCounts[status as keyof TaskStatusCounts]}</Text>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="arrow-top-right-thin-circle-outline" size={35} color="#e3dcdc" />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
