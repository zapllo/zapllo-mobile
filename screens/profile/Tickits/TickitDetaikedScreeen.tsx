import { StyleSheet, Text, View } from "react-native";
import React from "react";
import TickitCard from "~/components/profile/TickitCard";

interface DetailScreenProps {
    route: {
      params: {
        status: string;
        message: string;
        date: string;
      };
    };
  }
const TickitDetaikedScreeen:React.FC<DetailScreenProps> = ({ route }) => {
    const { status, message, date } = route.params;

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
