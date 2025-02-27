import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import NavbarTwo from "~/components/navbarTwo";
<<<<<<< HEAD
import { useNavigation } from "expo-router";
=======
import { router, useNavigation } from "expo-router";
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
import CustomDropdown from "~/components/customDropDown";
import { LinearGradient } from 'expo-linear-gradient';

export default function TutorialsScreen() {
  const navigation = useNavigation();
  const [searchTutorials, setSearchTutorials] = useState("");
  const [tutorials, setTutorials] = useState([]);
  const [filteredTutorials, setFilteredTutorials] = useState([]);
  const [selectTutorials, setSelectTutorials] = useState("");

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await fetch("https://zapllo.com/api/tutorials");
        const data = await response.json();
        setTutorials(data.tutorials);
        setFilteredTutorials(data.tutorials);
      } catch (error) {
        console.error("Error fetching tutorials:", error);
      }
    };
    fetchTutorials();
  }, []);

  const handleSearch = (text) => {
    setSearchTutorials(text);
    const filtered = tutorials.filter((tutorial) =>
      tutorial.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredTutorials(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tutorialCard}
      onPress={() => {
<<<<<<< HEAD
        navigation.navigate("TutorialDetails", { tutorialLink: item.link });
=======
        router.push({
          pathname: "/(routes)/HomeComponent/TutorialDetail/TutorialDetailScreen",
          params: { tutorialLink: item.link },
        });
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
      }}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.tutorialTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      <NavbarTwo title="Tutorials" onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            value={searchTutorials}
            onChangeText={handleSearch}
            placeholder="Search Tutorial"
            placeholderTextColor="#787CA5"
          />
        </View>
        <View style={styles.dropdownContainer}>
          <CustomDropdown
            data={[{ label: "All Tutorials", value: "" }]}
            placeholder="Select Filters"
            selectedValue={selectTutorials}
            onSelect={(value) => setSelectTutorials(value)}
          />
        </View>
        <FlatList
          data={filteredTutorials}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
=======
    <LinearGradient
      colors={['#05071E', '#1C1F3A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Tutorials" onBackPress={() => navigation.goBack()} />
        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              value={searchTutorials}
              onChangeText={handleSearch}
              placeholder="Search Tutorial"
              placeholderTextColor="#787CA5"
            />
          </View>
          <View style={styles.dropdownContainer}>
            <CustomDropdown
              data={[{ label: "All Tutorials", value: "" }]}
              placeholder="Select Filters"
              selectedValue={selectTutorials}
              onSelect={(value) => setSelectTutorials(value)}
            />
          </View>
          <FlatList
            data={filteredTutorials}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: "#05071E" },
=======
  gradient: {
    flex: 1,
  },
  container: { flex: 1 },
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
  content: { alignItems: "center", paddingBottom: 20 },
  searchContainer: { width: "90%", marginBottom: 17, marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#37384B",
    padding: 10,
    borderRadius: 15,
    color: "#fff",
    fontSize: 13,
    fontFamily: "LatoBold",
    height: 57,
  },
  dropdownContainer: { width: "90%", marginBottom: 17 },
<<<<<<< HEAD
  listContent: { alignItems: "center" },
  row: { justifyContent: "space-between", width: "90%" },
=======
  listContent: { alignItems: "center", paddingBottom: 290 },
  row: { justifyContent: "space-between", width: "94%" },
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
  tutorialCard: {
    width: "48%",
    borderRadius: 15,
    height: 200,
    overflow: "hidden",
    borderColor: "#37384B",
    borderWidth: 1,
    alignItems: "center",
<<<<<<< HEAD
    padding: 10,
=======
    padding: 8,
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
    marginBottom: 15,
  },
  thumbnail: { width: "100%", height: 100, borderRadius: 10 },
  tutorialTitle: {
    color: "#fff",
    fontFamily: "LatoBold",
    marginTop: 10,
    textAlign: "center",
  },
});
