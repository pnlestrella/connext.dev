import { useEffect, useRef } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type filteringTypes = {
    showFilter: boolean
}

const { height } = Dimensions.get("window");


export const Filtering = ({ showFilter }: filteringTypes) => {

    const translateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (showFilter) {
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20,
                stiffness: 160,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showFilter]);


    return (
        <>
            <Animated.View style={[styles.sheet, {
                transform: [{ translateY }]
            }]}>

            </Animated.View>
        </>

    );
};

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        bottom: -50,
        left: 0,
        right: 0,
        height: 630,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
        elevation: 5,
        zIndex: 999,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
});
