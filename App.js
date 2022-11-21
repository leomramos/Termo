import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_900Black,
  useFonts,
} from "@expo-google-fonts/nunito";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styled from "styled-components/native";

const ScreenWrapper = Styled(SafeAreaView)`
  flex: 1;
  padding-left: 20px;
  padding-right: 15px;
  background-color: #404040;
  padding-bottom: ${Platform.OS === "ios" ? 65 : 50}px;
`;

const Row = Styled.View`
  flex-direction: row;
  height: 65px;
  justify-content: space-between;
  align-items: center;
`;

const Col = Styled.TouchableOpacity.attrs({ activeOpacity: 0.85 })`
  width: 19%;
  height: auto;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  border-width: 5px;

  border-color: ${({ correct, misplaced }) =>
    correct ? "#003105" : misplaced ? "#607000" : "#232323"};
  border-bottom-width: ${({ selected }) => (selected ? 10 : 5)}px;
  background-color: rgba(${({ correct, misplaced }) =>
    correct ? "0, 49, 5" : misplaced ? "96, 112, 0" : "35, 35, 35"}, ${({
  disabled,
  filled,
}) => (disabled ? (filled ? 0.7 : 1) : 0)});
`;

const Options = Styled.View`
  margin-top: 25px;
  margin-bottom: 50px;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Keyboard = Styled.View`
  margin-top: auto;
`;

const KeysRow = Styled.View`
  flex-direction: row;
  margin: 5px 0;
  margin-left: -3px;
`;

const Key = Styled.TouchableOpacity`
  background-color: ${({ correct, misplaced }) =>
    correct ? "#003105" : misplaced ? "#607000" : "#232323"};
  border-radius: 5px;
  width: 25px;
  height: 45px;
  margin: 0 3px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled, wrong }) => (disabled ? 0.6 : wrong ? 0.7 : 1)};
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

  const keys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "backspace"],
    ["Z", "X", "C", "V", "B", "N", "M", "enter"],
  ];

  const [curDifficulty, setCurDifficulty] = useState(1);

  const cols = (v = "") => Array(5).fill(v);
  const getRows = (s = 5, c = cols) => Array(s).fill(c());

  const genRows = _ => getRows(difficulties[curDifficulty].rows);

  const [rows, setRows] = useState(genRows());
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [usedKeys, setUsedKeys] = useState([]);

  const [corrects, setCorrects] = useState([]);
  const [misplaceds, setMisplaceds] = useState([]);

  const [gameEnded, setGameEnded] = useState(false);

  const [correctKeys, setCorrectKeys] = useState([]);
  const [misplacedKeys, setMisplacedKeys] = useState([]);
  const [wrongKeys, setWrongKeys] = useState([]);

  const [charCount, setCharCount] = useState(0);

  const word = useRef("termo".toUpperCase());

  const updateRows = key => {
    switch (key) {
      case "backspace":
        setRows([
          ...rows.map((k, j) =>
            k.map((v, i) => (j === curRow && i === curCol ? "" : v))
          ),
        ]);

        if (curCol > 0) {
          setCurCol(curCol - 1);
        } else if (curCol === -1) {
          setCurCol(4);
        }
        break;
      case "enter":
        nextRow();
        break;
      default:
        if (curCol < 0) return;
        setRows([
          ...rows.map((k, j) =>
            k.map((v, i) => (j === curRow && i === curCol ? key : v))
          ),
        ]);
        usedKeys.indexOf(key) === -1 && setUsedKeys([...usedKeys, key]);
        setCharCount(charCount + 1);
        break;
    }
  };

  const nextRow = _ => {
    let endGame = false;
    const row = rows[curRow];

    if (row) {
      endGame = checkWord(row);
    }

    if (curRow + 1 === difficulties[curDifficulty].rows) endGame = true;

    endGame
      ? setGameEnded(true)
      : setCurRow(Math.min(curRow + 1, difficulties[curDifficulty].rows - 1));
  };

  const checkWord = row => {
    const term = word.current;
    let corKeys = [],
      misKeys = [],
      wrgKeys = [];

    setCorrects([
      ...corrects,
      row.map((v, i) => {
        const correct = v === term.charAt(i);

        correct && corKeys.indexOf(v) === -1 && corKeys.push(v);

        return correct;
      }),
    ]);

    setMisplaceds([
      ...misplaceds,
      row.map((v, i) => {
        const misplaced =
          v !== term.charAt(i) && row.indexOf(v) === i && term.includes(v);

        misplaced &&
          misKeys.indexOf(v) === -1 &&
          corKeys.indexOf(v) === -1 &&
          misKeys.push(v);

        return misplaced;
      }),
    ]);

    usedKeys.forEach(
      k =>
        corKeys.indexOf(k) === -1 &&
        misKeys.indexOf(k) === -1 &&
        wrgKeys.push(k)
    );

    setCorrectKeys([...correctKeys, ...corKeys]);
    setMisplacedKeys([...misplacedKeys, ...misKeys]);

    setWrongKeys([...wrongKeys, ...wrgKeys]);

    return row.join("") === term;
  };

  useEffect(
    _ => {
      setCurCol(0);
    },
    [curRow]
  );

  const reset = _ => {
    setRows(genRows());
    setCurRow(0);
    setCurCol(0);
    setUsedKeys([]);
    setCorrects([]);
    setMisplaceds([]);
    setCorrectKeys([]);
    setMisplacedKeys([]);
    setWrongKeys([]);
    setGameEnded(false);
  };

  useEffect(_ => setRows(genRows()), [curDifficulty]);
  useEffect(
    _ => {
      let nextIndex = rows[curRow].indexOf("", curCol);

      if (nextIndex === -1) nextIndex = rows[curRow].indexOf("");

      setCurCol(nextIndex);
    },
    [charCount]
  );

  return (
    <ScreenWrapper onLayout={onLayoutRootView}>
      <StatusBar
        style="light"
        animated
        backgroundColor="#404040"
        transluscent
      />
      <Options>
        <View
          style={{
            flexDirection: "row",
            marginLeft: -5,
            opacity: usedKeys.length !== 0 ? 0.7 : 1,
          }}
        >
          {difficulties.map((d, i) => (
            <TouchableOpacity
              disabled={usedKeys.length !== 0}
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
        <TouchableHighlight
          onPress={reset}
          underlayColor="#232323"
          style={{
            borderColor: "whitesmoke",
            borderWidth: 2,
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 30,
          }}
        >
          <Text
            style={{
              color: "whitesmoke",
              fontSize: 16,
              fontFamily: fontsLoaded ? "Nunito_600SemiBold" : null,
              textTransform: "lowercase",
            }}
          >
            {gameEnded ? "Restart" : "Give up"}
          </Text>
        </TouchableHighlight>
      </Options>
      <ScrollView style={{ marginBottom: 50 }}>
        {rows.map((k, j) => (
          <Row key={`row-${j}`}>
            {k.map((v, i) => (
              <Col
                correct={corrects[j] && corrects[j][i]}
                misplaced={misplaceds[j] && misplaceds[j][i]}
                disabled={j !== curRow || gameEnded}
                selected={j === curRow && i === curCol}
                filled={j < curRow || (j === curRow && gameEnded)}
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
      </ScrollView>
      <Keyboard>
        {keys.map((k, j) => (
          <KeysRow key={`keys-row-${j}`} style={{ marginLeft: j * 6 }}>
            {k.map(v => (
              <Key
                correct={correctKeys.indexOf(v) !== -1}
                misplaced={misplacedKeys.indexOf(v) !== -1}
                wrong={wrongKeys.indexOf(v) !== -1}
                key={`key-${v}`}
                style={
                  v.length > 1 && {
                    marginLeft: "auto",
                    width: "auto",
                    paddingHorizontal: v === "backspace" ? 5 : 12,
                  }
                }
                disabled={
                  gameEnded ||
                  (v === "enter" && rows[curRow].some(el => el === ""))
                }
                onPress={() => updateRows(v)}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: fontsLoaded ? "Nunito_700Bold" : null,
                    fontSize: v === "backspace" ? 14 : 16,
                    textAlignVertical: "center",
                    textTransform: "uppercase",
                  }}
                >
                  {v === "backspace" ? "⌫" : v}
                </Text>
              </Key>
            ))}
          </KeysRow>
        ))}
      </Keyboard>
    </ScreenWrapper>
  );
}
