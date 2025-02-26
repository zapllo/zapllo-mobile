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
import { router, useNavigation } from "expo-router";
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
        router.push({
          pathname: "/(routes)/HomeComponent/TutorialDetail/TutorialDetailScreen",
          params: { tutorialLink: item.link },
        });
      }}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <Text style={styles.tutorialTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
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
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: { flex: 1 },
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
  listContent: { alignItems: "center", paddingBottom: 290 },
  row: { justifyContent: "space-between", width: "94%" },
  tutorialCard: {
    width: "48%",
    borderRadius: 15,
    height: 200,
    overflow: "hidden",
    borderColor: "#37384B",
    borderWidth: 1,
    alignItems: "center",
    padding: 8,
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
