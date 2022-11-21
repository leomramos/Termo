import { useFonts } from "@expo-google-fonts/nunito";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styled from "styled-components/native";

const ScreenWrapper = Styled(SafeAreaView)`
  flex: 1;
  padding-left: 20px;
  padding-right: 15px;
  background-color: #404040;
`;
const Row = Styled.View`
  flex-direction: row;
  height: 65px;
  justify-content: space-between;
  align-items: center;
  /* background-color: yellow; */
`;
const Col = Styled.TouchableOpacity.attrs({ activeOpacity: 0.85 })`
  width: 19%;
  height: auto;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border-width: 5px;

  border-color: #232323;
  border-bottom-width: ${({ selected }) => (selected ? 10 : 5)}px;
  background-color: rgba(35, 35, 35, ${({ disabled, filled }) =>
    disabled ? (filled ? 0.7 : 1) : 0});
`;
const Options = Styled.View`
  margin-top: 25px;
  margin-bottom: 50px;
`;

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const difficulties = [
    { label: "Easy", rows: 6 },
    { label: "Medium", rows: 5 },
    { label: "Hard", rows: 4 },
  ];

  const [curDifficulty, setCurDifficulty] = useState(1);

  const cols = (v = "") => Array(5).fill(Math.round(Math.random() * 10));
  const getRows = (s = 5, c = cols) => Array(s).fill(c());

  const [rows, setRows] = useState(getRows(difficulties[curDifficulty].rows));
  const [curRow, setCurRow] = useState(1);
  const [curCol, setCurCol] = useState(0);

  const updateRows = key => {
    setRows([
      ...rows.map((k, j) =>
        k.map((v, i) => (j === curRow && i === curCol ? key : v))
      ),
    ]);
  };

  useEffect(_ => updateRows("t"), []);
  useEffect(_ => setRows(difficulties[curDifficulty].rows), [curDifficulty]);

  return (
    <ScreenWrapper onLayout={onLayoutRootView}>
      <StatusBar
        style="light"
        animated
        backgroundColor="#404040"
        transluscent
      />
      <Options>
        <View style={{ flexDirection: "row", marginLeft: -5 }}>
          {difficulties.map((d, i) => (
            <TouchableOpacity
              disable={curRow !== 0}
              key={`difficulty-${d.label}`}
              onPress={() => setCurDifficulty(i)}
              style={{ padding: 5 }}
            >
              <Text
                style={{
                  color: "whitesmoke",
                  fontSize: 16,
                  fontFamily: fontsLoaded ? "Nunito_600SemiBold" : null,
                  textTransform: "lowercase",
                  opacity:
                    d.label === difficulties[curDifficulty].label ? 1 : 0.3,
                }}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Options>
      <View>
        {rows.map((k, j) => (
          <Row key={`row-${j}`}>
            {k.map((v, i) => (
              <Col
                disabled={j !== curRow}
                selected={j === curRow && i === curCol}
                filled={j < curRow}
                key={`col-${j}-${i}`}
                onPress={() => setCurCol(i)}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: fontsLoaded ? "Nunito_900Black" : null,
                    fontSize: 40,
                    textAlignVertical: "center",
                    marginTop: -3,
                    textTransform: "uppercase",
                  }}
                >
                  {v}
                </Text>
              </Col>
            ))}
          </Row>
        ))}
      </View>
    </ScreenWrapper>
  );
}
