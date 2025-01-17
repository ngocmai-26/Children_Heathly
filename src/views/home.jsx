import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import heart from "../../assets/heart.png";
import connect from "../../assets/connect.png";
import spo2 from "../../assets/spo2.png";
import happy from "../../assets/happy.png";
import sad from "../../assets/sad.png";
import bt from "../../assets/bt.png";
import thermometer from "../../assets/thermometer.png";
import Layout from "../layout/layout";
import { getSensor } from "../thunks/sencorThunk";
import { connectDevice } from "../thunks/deviceThunk";

const HomeScreen = () => {
  const allSensor = useSelector((state) => state.IoTReducer.allSensor);
  const user = useSelector((state) => state.authReducer.user);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSensor(user?.iduser));

    const interval = setInterval(() => {
      dispatch(getSensor(user?.iduser));
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, user?.iduser]);

  const allSensorData = allSensor?.flatMap(
    (sensor) => sensor.sensor_data || []
  );

  // Get the data closest to the current time
  const latestData = allSensorData?.reduce((closest, current) => {
    const currentTime = new Date(); // Current time
    const currentTimestamp = new Date(current.timestamp); // Timestamp of the current data
    const closestTimestamp = new Date(closest.timestamp); // Timestamp of the closest data

    // Compare the time difference between current data and current time with the closest data
    return Math.abs(currentTime - currentTimestamp) < Math.abs(currentTime - closestTimestamp)
      ? current
      : closest;
  }, allSensorData[0]);

  // Check conditions for status
  const ketQuaNhietDo = latestData?.ketQuaNhietDo?.includes("Nguy hiểm");
  const ketQuaSp02 = latestData?.ketQuaSp02?.includes("Nguy hiểm");
  const ketQuaNhipTim = latestData?.ketQuaNhipTim?.includes("Nguy hiểm");

  // Check if any of the results indicate danger
  const isDanger = [ketQuaNhietDo, ketQuaSp02, ketQuaNhipTim].some(
    (result) => result === true
  );

  const handleSensorToggle = (sensor) => {
    const newStatus = !sensor?.status;
    dispatch(connectDevice(sensor.idsensor, { status: newStatus }));
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.deviceCard} key={allSensor[0]?.id}>
          <Image source={connect} style={styles.deviceIcon} />
          <Text style={styles.deviceStatusText}>
            {allSensor[0]?.status ? "Đã kết nối thiết bị" : "Thiết bị chưa kết nối"}
          </Text>
          <TouchableOpacity onPress={() => handleSensorToggle(allSensor[0])}>
            <Text style={styles.reconnectText}>
              {allSensor[0]?.status ? "Ngắt kết nối" : "Kết nối lại"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoContainer}>
          {/* Status */}
          <View style={styles.infoCard}>
            <Image source={isDanger ? sad : happy} style={styles.icon} />
            <Text style={styles.labelText}>Trạng Thái</Text>
            {ketQuaNhietDo && (
              <Text style={[styles.valueText, { color: "red" }]}>
                {latestData?.ketQuaNhietDo}
              </Text>
            )}
            {ketQuaSp02 && (
              <Text style={[styles.valueText, { color: "red" }]}>
                {latestData?.ketQuaSp02}
              </Text>
            )}
            {ketQuaNhipTim && (
              <Text style={[styles.valueText, { color: "red" }]}>
                {latestData?.ketQuaNhipTim}
              </Text>
            )}
            {!ketQuaNhietDo && !ketQuaNhipTim && !ketQuaSp02 && (
              <Text style={[styles.valueText, { color: "green" }]}>
                Bình thường
              </Text>
            )}
          </View>

          {/* Temperature */}
          <View style={[styles.infoCard, { backgroundColor: ketQuaNhietDo ? "#f74d58" : 'white' }]}>
            <Image source={thermometer} style={styles.icon} />
            <Text style={styles.labelText}>Nhiệt độ</Text>
            <Text style={styles.valueText}>
              {latestData ? `${latestData?.temp}°C` : "---"}
            </Text>
          </View>

          {/* Heart Rate */}
          <View style={[styles.infoCard, { backgroundColor: ketQuaNhipTim ? "#f74d58" : 'white' }]}>
            <Image source={heart} style={styles.icon} />
            <Text style={styles.labelText}>Nhịp tim</Text>
            <Text style={styles.valueText}>
              {latestData
                ? `${Math.round(latestData?.heartrate)} lần / phút`
                : "---"}
            </Text>
          </View>

          {/* SPO2 */}
          <View style={[styles.infoCard, { backgroundColor: ketQuaSp02 ? "#f74d58" : 'white' }]}>
            <Image source={spo2} style={styles.icon} />
            <Text style={styles.labelText}>SPO2</Text>
            <Text style={styles.valueText}>
              {latestData ? `${Math.round(latestData?.sp02)}%` : "---"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  deviceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  deviceStatusText: {
    fontSize: 18,
    marginBottom: 10,
  },
  reconnectText: {
    fontSize: 16,
    color: "#FF7F00",
  },
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  valueText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
