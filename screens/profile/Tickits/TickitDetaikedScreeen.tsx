import { StyleSheet, Text, View } from "react-native";
import React from "react";
import TickitCard from "~/components/profile/TickitCard";

interface DetailScreenProps {
    route: {
      params: {
        status: any;
        message: any;
        date: any;
        subCategory:any;
      };
    };
  }
const TickitDetaikedScreeen:React.FC<DetailScreenProps> = ({ route }) => {
    const { status, message, date,subCategory } = route.params;

    return (
      <View >
        <Text >Ticket Details</Text>
        <Text >Status: {status}</Text>
        <Text >Message: {message}</Text>
        <Text >Date: {date}</Text>
      </View>
    );
}

const styles = StyleSheet.create({});
