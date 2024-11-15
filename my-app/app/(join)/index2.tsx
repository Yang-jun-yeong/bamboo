import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Image,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const { userData: initialUserData } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState<string>('');
  const [chatbotName, setChatbotName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
   // 비율 계산 및 cloudTopPosition 설정
  const aspectRatio = screenWidth / screenHeight;
  const cloudTopPosition = aspectRatio >= 0.6 ? '40%' : '50%';

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cloudAnim = useRef(new Animated.Value(1)).current;
  const cloudScale = useRef(new Animated.Value(0.1)).current;
  const chatbotScale = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  const questions = [
    //외향/ 내향
    {
        "question": "밤부의 성격을 형성하는 단계입니다.\n답변을 선택해주세요.",
        "aiResponse": "당신이 새로운 사람과 만날 때, 어떻게 느끼시나요?",
        "responses": ["재미있고 활기찬 시간을 기대한다 ", "약간 부담스럽고 긴장된다 "]
    },
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "처음 가본 낯선 곳에서 시간 보낼 때,",
        "responses": ["이곳저곳 탐험하고 싶다 ", "조용히 내 시간을 보낸다 "]
    },
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "팀 프로젝트가 주어졌을 때, 나는",
        "responses": ["사람들과 적극적으로 의견을 나눈다 ", "조용히 맡은 부분을 처리한다 "]
    },
    // 공감 / 논리
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "친구가 고민을 이야기할 때, 나는",
        "responses": ["상대방의 감정을 공감하며 위로한다 ", "상황을 객관적으로 분석하며 조언한다 "]
    },
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "무인도에 떨어졌을 때, 나는",
        "responses": ["함께 살아남을 방법을 고민한다 ", "혼자 생존을 위한 방안을 마련한다 "]
    },
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "실수를 했을 때, 나는",
        "responses": ["상대방의 감정을 헤아리며 사과한다 ", "상황을 분석하고 개선 방안을 제시한다 "]
    },
    {
        "question": "다음 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "누군가가 도움을 요청할 때, 나는",
        "responses": ["당연히 돕고 싶다 ", "신중하게 판단한 후 돕는다 "]
    },
    {
        "question": "마지막 질문입니다.\n어떻게 생각하시나요?",
        "aiResponse": "사람들과의 갈등 상황에서, 나는",
        "responses": ["상대방의 입장을 이해하며 대화한다 ", "상황을 객관적으로 정리하며 논리적으로 해결한다 "]
    },
    { question: '밤부의 이름을 지어주세요', aiResponse: '좋은 이름을 기대할게요!', responses: [] },
  ];

  const validIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentQuestion = questions[validIndex];
  const isLastQuestion = validIndex === questions.length - 1;

  const handleSelectResult = (value: '0' | '1') => {
    setTestResults((prevResults) => prevResults + value);
  };

  const startChatbotAnimation = () => {
    chatbotScale.setValue(0);
    Animated.timing(chatbotScale, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const hideChatbotAnimation = (callback: () => void) => {
    Animated.timing(chatbotScale, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(callback);
  };

  const handleResponsePress = (index: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    handleSelectResult(index === 0 ? '0' : '1');
    if (currentQuestionIndex === questions.length - 2) {
      startCloudAnimation();
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsProcessing(false));

      updateCloudScale(currentQuestionIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      if (currentQuestionIndex === questions.length - 1) {
        cloudAnim.setValue(1);
        hideChatbotAnimation(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            fadeAnim.setValue(0);

            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start(() => setIsProcessing(false));

            updateCloudScale(newIndex);
          });
        });
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          const newIndex = currentQuestionIndex - 1;
          setCurrentQuestionIndex(newIndex);
          fadeAnim.setValue(0);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start(() => setIsProcessing(false));

          updateCloudScale(newIndex);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
      }
    }
  };

  const startCloudAnimation = () => {
    Animated.timing(cloudAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const updateCloudScale = (index: number) => {
    let targetScale = 1;
    const aspectRatio = screenWidth / screenHeight; // 화면 비율 계산
    console.log(aspectRatio);
    const scaleLimits = aspectRatio >= 0.6
      ? [0.1, 0.15, 0.25, 0.35, 0.5, 0.7, 1.0, 1.3] // 비율이 0.6 이상일 때 스케일 값
      : [0.1, 0.2, 0.4, 0.5, 0.9, 1.4, 2.0, 2.7];  // 비율이 0.6 미만일 때 스케일 값

    if (index < scaleLimits.length) {
      targetScale = scaleLimits[index];
    } else {
      targetScale = scaleLimits[scaleLimits.length - 1];
    }

    Animated.timing(cloudScale, {
      toValue: targetScale,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // 스타일 정의에서 조건부로 top 조절
  const dynamicStyles = (aspectRatio) => ({
    cloudContainer: {
      position: 'absolute',
      top: aspectRatio >= 0.6 ? '40%' : '50%', // 비율이 0.6 이상일 때 위치를 위로 올림
      alignSelf: 'center',
      zIndex: 1,
    },
  });

  useEffect(() => {
    if (isLastQuestion) {
      startChatbotAnimation();
    } else {
      chatbotScale.setValue(0);
    }
  }, [currentQuestionIndex]);
  console.log("2차 보낼 데이터",initialUserData,testResults, chatbotName)
  const handleConfirm = () => {
    if (chatbotName.trim()) {
      router.push({
        pathname: '/(join)/sendUserInfo',
        params: { userData: initialUserData, testResults, chatbotName },
      });
    } else {
      alert('챗봇 이름을 입력해주세요.');
    }
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
return (
  <JoinBG>
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container,
          { paddingVertical: screenHeight * 0.05, paddingBottom: 200 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.chatBubble, { width: screenWidth * 0.9, top: -screenHeight * 0.05 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

        <Animated.View style={[styles.aiResponse, { opacity: fadeAnim, width: screenWidth * 0.85, top: screenHeight * 0.07 }]}>
          {!isLastQuestion ? (
            <TouchableOpacity
              style={styles.aiResponseButton}
              onPress={() => !isProcessing && handleResponsePress(0)}
              disabled={isProcessing}
            >
              <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
          )}
        </Animated.View>

        {!isLastQuestion ? (
          <>
            <Animated.View
              style={[
                styles.cloudContainer,
                { top:cloudTopPosition,transform: [{ scale: cloudScale }], opacity: cloudAnim, width: screenWidth * 0.6, height: screenWidth * 0.3 },
              ]}
            >
              <Image source={require('../../assets/images/구름.png')} style={styles.cloudImage} resizeMode="contain" />
            </Animated.View>

            <View style={styles.responseContainer}>
              <View style={styles.progressContainer}>
                {questions.slice(0, -1).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentQuestionIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>

              {currentQuestion.responses.map((response, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.responseButton,
                    { opacity: fadeAnim, height: screenHeight * 0.06, width: screenWidth * 0.85, borderColor: index === 0 ? '#4a9960' : '#ccc' },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.responseButtonTouchable}
                    onPress={() => !isProcessing && handleResponsePress(index)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.responseText}>{response}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}

              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentQuestionIndex > 0 ? {} : { opacity: 0 },
                  ]}
                  onPress={currentQuestionIndex > 0 ? handlePrevious : null}
                  disabled={isProcessing || currentQuestionIndex === 0}
                >
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.lastQuestionContainer}>
            <View style={[styles.chatbotContainer, { top: '20%' }]}>
              <Animated.Image
                source={require('../../assets/images/bamboo_head.png')}
                style={[styles.chatbotImage, { width: screenWidth * 0.4, height: screenWidth * 0.4, transform: [{ scale: chatbotScale }] }]}
                resizeMode="contain"
              />
              <TextInput
                style={[
                  styles.nameInput,
                  { width: screenWidth * 0.8, top: screenHeight*0.05,borderColor: chatbotName ? '#4a9960' : '#999', backgroundColor: isFocused ? '#eef6ee' : '#FFF' },
                ]}
                value={chatbotName}
                onChangeText={setChatbotName}
                placeholder="밤부의 이름을 입력하세요"
                placeholderTextColor="#999"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <Text style={[styles.warningText,{top:-screenHeight*0.05}]}>밤부의 이름은 변경할 수 없습니다.‼️</Text>

              <View style={[styles.navigationButtons, { top: '5%', flexDirection: 'row', justifyContent: 'center' }]}>
                {currentQuestionIndex > 0 && (
                  <SmoothCurvedButton
                    title="이전"
                    onPress={handlePrevious}
                    disabled={isProcessing}
                    style={{
                      width: screenWidth * 0.4,
                      height: 50,
                      marginHorizontal: 10,
                    }}
                  />
                )}
                <SmoothCurvedButton
                  title="확인"
                  onPress={handleConfirm}
                  disabled={!chatbotName.trim() || isProcessing}
                  style={{
                    opacity: chatbotName.trim() ? 1 : 0.6,
                    width: screenWidth * 0.4,
                    height: 50,
                    marginHorizontal: 10,
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  </JoinBG>
);

};

// 스타일 정의
const styles = StyleSheet.create({
  // 경고 텍스트 스타일: 경고 메시지를 빨간색으로 중앙 정렬하고, 상단에 약간의 여백을 추가하여 다른 요소와 분리
  warningText: {
    color: 'red',               // 텍스트 색상을 빨간색으로 설정
    textAlign: 'center',        // 텍스트를 중앙에 정렬
    marginTop: 10,              // 상단에 10px 여백을 추가하여 다른 요소와 간격을 줌
    fontSize: 14,               // 텍스트 크기를 14px로 설정
  },

  // 화면 전체 컨테이너 스타일: 스크롤 시 화면에 꽉 차도록 설정하고, 자식 요소를 중앙에 정렬
  container: {
    flexGrow: 1,                // 스크롤 뷰가 화면 전체를 채우도록 설정
    alignItems: 'center'        // 자식 요소를 수평 중앙으로 정렬
  },

  // 채팅 버블 스타일: 질문 또는 응답 텍스트를 감싸는 영역으로, 모서리를 둥글게 처리하여 버블 모양으로 설정
  chatBubble: {
    borderRadius: 30,           // 모서리를 둥글게 처리하여 버블 모양을 만듦
    padding: '4%',              // 버블 내부 여백을 설정하여 텍스트가 가장자리와 떨어져 있도록 함
    marginBottom: '5%'          // 다른 요소와의 간격을 위해 하단에 5% 여백 추가
  },

  // 채팅 텍스트 스타일: 채팅 버블 안의 텍스트 스타일 설정
  chatText: {
    fontSize: 16,               // 텍스트 크기를 16px로 설정
    color: '#000',              // 텍스트 색상을 검은색으로 설정
    textAlign: 'center'         // 텍스트를 중앙 정렬하여 깔끔하게 표시
  },

  // 챗봇 컨테이너 스타일: 챗봇 이미지와 관련 요소들을 수직으로 중앙 정렬하고 여백 추가
  chatbotContainer: {
    alignItems: 'center',       // 자식 요소를 수평 중앙으로 정렬
  },

  // 챗봇 이미지 스타일: 챗봇 이미지를 화면에 표시하기 위한 스타일
  chatbotImage: {
    marginBottom: 30            // 이미지 하단에 20px 여백 추가하여 텍스트와의 간격 확보
  },

  // 이름 입력 필드 스타일: 사용자가 챗봇 이름을 입력할 수 있는 텍스트 입력 필드
  nameInput: {
    borderWidth: 1,             // 입력 필드 테두리 두께를 1px로 설정
    borderColor: '#999',        // 테두리 색상을 회색으로 설정
    borderRadius: 12,           // 모서리를 둥글게 처리하여 깔끔한 외형 제공
    padding: 10,                // 입력 필드 내부 여백 설정
    fontSize: 16,               // 입력 텍스트 크기를 16px로 설정
    textAlign: 'center',        // 텍스트를 중앙 정렬하여 보기 좋게 표시
    backgroundColor: '#FFF'     // 배경색을 흰색으로 설정하여 깔끔한 외형 제공
  },

  // 응답 컨테이너 스타일: 사용자 응답 버튼들을 포함하는 영역
  responseContainer: {
    alignItems: 'center',       // 자식 요소들을 수평 중앙 정렬
    position: 'absolute',       // 화면의 고정된 위치에 배치
    bottom: 20,                 // 화면 하단에서 20px 위에 배치하여 충분한 여백 확보
    width: '100%',              // 컨테이너 너비를 화면 너비로 설정
    paddingHorizontal: '5%'     // 좌우 패딩을 5% 추가하여 화면 가장자리와 떨어뜨림
  },

  // AI 응답 스타일: AI가 생성한 응답을 표시할 때 사용하는 스타일
  aiResponse: {
    backgroundColor: '#E8E8E8', // 배경색을 연회색으로 설정하여 채팅 버블과 구분
    borderRadius: 30,           // 모서리를 둥글게 처리하여 부드러운 외형 제공
    padding: '4%',              // 내부 여백을 설정하여 텍스트와 가장자리 간격 확보
    position: 'absolute',       // 고정된 위치에 배치
    top: 180,                   // 화면 상단에서 180px 아래에 배치
    zIndex: 2,                  // 다른 요소 위에 표시되도록 z-index 설정
    shadowColor: '#000',        // 그림자 색상을 검은색으로 설정
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치 조정
    shadowOpacity: 0.2,         // 그림자 투명도 설정
    shadowRadius: 3.84,         // 그림자 반경 설정
    elevation: 5                // 안드로이드 그림자 효과 적용
  },

  // AI 응답 버튼 스타일: AI 응답을 버튼 형태로 표시
  aiResponseButton: {
    width: '100%',              // 버튼 너비를 컨테이너 너비에 맞춤
    padding: 10                 // 버튼 내부 여백 추가
  },

  // 응답 버튼 터치 가능한 영역 스타일: 사용자 응답 버튼의 터치 가능한 영역
  responseButtonTouchable: {
    width: '100%',              // 터치 영역을 컨테이너 너비에 맞춤
    padding: 3                 // 터치 영역 내부 여백 추가
  },

  // 구름 컨테이너 스타일: 애니메이션 효과가 적용된 구름 이미지 컨테이너
  cloudContainer: {
    position: 'absolute',       // 고정된 위치에 배치
    alignSelf: 'center',        // 구름을 화면 중앙에 배치
    zIndex: 1                   // 다른 요소 아래에 배치되도록 z-index 설정
  },

  // 구름 이미지 스타일: 구름 이미지 크기를 컨테이너에 맞춤
  cloudImage: {
    width: '100%',              // 이미지 너비를 컨테이너 너비에 맞춤
    height: '100%'              // 이미지 높이를 컨테이너 높이에 맞춤
  },

  // AI 응답 텍스트 스타일: AI 응답 텍스트의 폰트 크기 설정
  aiResponseText: {
    fontSize: 16                // 텍스트 크기를 16px로 설정하여 읽기 쉽게 표시
  },
  // 응답 버튼 스타일: 사용자 응답 옵션 버튼의 스타일
  responseButton: {
    backgroundColor: '#FFF',    // 버튼 배경색을 흰색으로 설정
    borderRadius: 30,           // 모서리를 둥글게 처리하여 버튼 외형 부드럽게 만듦
    paddingVertical: 10,        // 상하 패딩을 설정하여 버튼 크기 조절
    paddingHorizontal: '4%',
    marginBottom: '3%',         // 버튼 간격을 위해 하단에 3% 마진 추가
    shadowColor: '#000',        // 그림자 색상 설정
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치 조정
    shadowOpacity: 0.2,         // 그림자 투명도 설정
    shadowRadius: 3.84,         // 그림자 반경 설정
    elevation: 5,               // 안드로이드 그림자 효과 적용
    justifyContent: 'center',   // 텍스트를 수직 중앙에 정렬
    alignItems: 'center',       // 텍스트를 가로 중앙에 정렬
    width: '90%',               // 버튼 너비를 90%로 설정하여 화면에 맞춤
  },

  // 응답 텍스트 스타일: 응답 텍스트의 폰트 크기와 정렬 설정
  responseText: {
    fontSize: 16,               // 텍스트 크기를 16px로 설정
    textAlign: 'center',        // 텍스트를 중앙 정렬하여 버튼 내에서 보기 좋게 표시
    lineHeight: 20,             // 줄 높이를 설정하여 수직 중앙에 위치하도록 함
  },


  // 내비게이션 버튼 컨테이너 스타일: '이전' 및 '확인' 버튼들을 담고 있는 컨테이너
  navigationButtons: {
    justifyContent: 'center',   // 버튼을 중앙에 정렬
    marginTop: '5%',            // 상단에 5% 마진 추가
    marginBottom: 20            // 하단에 20px 마진 추가하여 다른 요소와 간격 확보
  },

  // 내비게이션 버튼 스타일: '이전' 및 '확인' 버튼의 외형 스타일
  navButton: {
    paddingVertical: 12,          // 버튼의 상하 패딩을 추가하여 터치 영역 확대
    paddingHorizontal: 30,        // 좌우 패딩을 추가하여 터치 영역 확대
    marginHorizontal: '2%',       // 버튼 간격을 위해 좌우에 2% 마진 추가
    minWidth: 80,                 // 버튼의 최소 너비 설정
    alignItems: 'center',         // 텍스트를 중앙에 정렬
  },

  // 내비게이션 버튼 텍스트 스타일: '이전' 및 '확인' 버튼 텍스트 스타일
  navButtonText: {
    fontSize: 14,               // 텍스트 크기를 14px로 설정
    color: '#000'               // 텍스트 색상을 검은색으로 설정
  },

  // 진행 상황 도트 컨테이너 스타일: 현재 진행 상황을 나타내는 도트들을 포함
  progressContainer: {
    flexDirection: 'row',       // 도트를 가로로 나란히 배치
    justifyContent: 'center',   // 도트를 중앙에 정렬
    alignItems: 'center',       // 도트를 수직 중앙에 정렬
    marginBottom: '5%',         // 하단에 5% 마진 추가
    marginTop: '-2%',            // 상단에 -2% 마진 추가하여 다른 요소와 간격 조정
  },

  // 비활성 도트 스타일: 기본 도트의 크기와 색상
  dot: {
    width: 8,                   // 도트의 너비를 8px로 설정
    height: 8,                  // 도트의 높이를 8px로 설정
    borderRadius: 4,            // 도트를 원형으로 만들기 위해 반지름 설정
    backgroundColor: '#E8E8E8', // 비활성 도트 배경색을 연회색으로 설정
    marginHorizontal: 4         // 도트 간의 간격을 위해 좌우에 4px 마진 추가
  },

  // 활성 도트 스타일: 현재 질문을 나타내는 활성 도트의 크기와 색상
  activeDot: {
    backgroundColor: '#4a9960', // 활성 도트 색상을 초록색으로 설정
    width: 10,                  // 활성 도트 너비를 10px로 설정하여 강조
    height: 10,                 // 활성 도트 높이를 10px로 설정
    borderRadius: 5             // 도트를 원형으로 만들기 위해 반지름 설정
  },
});

export default KeywordSelectionScreen;
