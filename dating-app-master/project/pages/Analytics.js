import React, { useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TextStandard from '../components/TextStandard';
import PageContainer from '../components/PageContainer';
import ThemeContext from '../contexts/ThemeContext';
import globalProps, { globalThemes, utilsGlobalStyles } from '../styles_global';
import { useAuth } from "../AuthContext";
import propsHeaderButtons from '../components/props_header_buttons';
import { BarChart, PieChart } from 'react-native-chart-kit';

function Analytics({ navigation }) {
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];


    const { userData, logOut } = useAuth();


    const likesFromYou = userData.analytics.likesFromYou;
    const likesFromThem = userData.analytics.likesFromThem;

    // Calculate the ratio
    const likesRatio = likesFromYou / likesFromThem;
    // Define data for the pie chart.
    const data = [
        {
        name: 'Account Views',
        population: userData.analytics.accountViews,
        color: '#3D66F1',
        legendFontColor: '#3D66F1',
        legendFontSize: 15,
        },
        {
        name: 'Liked Other',
        population: userData.analytics.likesFromYou,
        color: '#A261EC',
        legendFontColor: '#A261EC',
        legendFontSize: 15,
        },
        {
        name: 'Profile Likes',
        population: userData.analytics.likesFromThem,
        color: '#E75378',
        legendFontColor: '#E75378',
        legendFontSize: 15,
        },
    ];

    const PerformanceGraphData=[
        {
            name:'Likes Ratio',
            population: likesRatio,
        },
    ];

  return (
    <PageContainer
      navigation={navigation}
      showNavBar
      propsLeftHeaderButtons={[propsHeaderButtons.back]}
    >
        {/* Analytics stuff */}
        <View style={styles.container}>
        <PieChart
            data={data}
            width={360}
            height={200}
            chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
        />
        </View>
        <View style={{paddingBottom:15}}> 
        <TextStandard text="Analytics" size={2} isBold style={{ textAlign: 'left', color: '#2D55DC', marginBottom: 15 }} />

        <Card icon="eye" title=" Your account views " value={userData.analytics.accountViews} color="#3D66F1" />
        <Card icon="heart" title=" You have liked other accounts " value={userData.analytics.likesFromYou} color="#A261EC" />
        <Card icon="thumb-up" title=" Your profile likes " value={userData.analytics.likesFromThem} color="#E75378" />

        </View>
    </PageContainer>
  );
}
// Define your Card component (you can create a separate Card.js file)
function Card({ icon, title, value, color }) {
    // Acquire global theme.
    const { themeName } = useContext(ThemeContext);
    let theme = globalThemes[themeName];
    return (
      <View style={styles.card}>
        <MaterialCommunityIcons name={icon} color={theme.iconButtonNextPage} size={globalProps.sizeIconHeaderFooter} />
        <TextStandard text={title} size={1} isBold />
        <TextStandard text={value} size={1.2} isBold style={{ color: color }} />
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
        flexDirection: 'row',
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default Analytics;
