import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Share2, MessageSquare, Apple } from 'lucide-react';
import './index.css';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Recommendation {
  model: string;
  description: string;
  price: string;
  image: string;
  link: string;
}

const questions = [
  {
    id: 1,
    question: 'Какъв е вашият бюджет за закупуване на iPhone?',
    options: ['Под 1000 лв.', '1000 - 1600 лв.', '1600 - 2000 лв.', 'Над 2000 лв.'],
  },
  {
    id: 2,
    question: 'Какви са основните ви нужди при използването на iPhone?',
    options: [
      'Основно използване (обаждания, съобщения, браузване)',
      'Социални мрежи и гледане на съдържание',
      'Фотография и видеозаснемане',
      'Игри',
      'Професионална употреба (имейли, приложения за продуктивност, многозадачност)',
    ],
  },
  {
    id: 3,
    question: 'Колко важен е животът на батерията за вас?',
    options: [
      'Много важен, трябва да издържа цял ден при интензивна употреба',
      'Важен, но мога да зареждам през деня',
      'Не е от голямо значение',
    ],
  },
  {
    id: 4,
    question: 'Предпочитате ли по-компактен телефон или по-голям дисплей за по-добра видимост?',
    options: [
      'По-малък и компактен телефон',
      'По-голям дисплей за медия и продуктивност',
      'Нямам предпочитания',
    ],
  },
  {
    id: 5,
    question: 'Колко място за съхранение ви е необходимо?',
    options: ['64GB или по-малко', '128GB', '256GB', '512GB или повече'],
  },
  {
    id: 6,
    question: 'Колко важна е камерата за вас?',
    options: ['Основна употреба', 'Важно за снимки в движение', 'Професионална фотография'],
  },
  {
    id: 7,
    question: 'Планирате ли да използвате iPhone за дълго време?',
    options: ['Краткосрочна употреба (1-2 години)', 'Средносрочна употреба (2-4 години)', 'Дългосрочна употреба (над 4 години)'],
  }
];

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
        <p className="text-white text-xl mt-4 text-center absolute left-1/2 transform -translate-x-1/2">
          Зареждане...
        </p>
      </div>
    </div>
  );
};

export default function EnhancedAppleStyleIPhoneRecommendationTool() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [hasFetched, setHasFetched] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, [currentQuestion, showResults]);

  const shouldFetchRecommendation = () => {
    return currentQuestion === questions.length - 1 && !hasFetched;
  };

  const handleAnswer = (answer: string) => {
    setFadeIn(false);
    
    setAnswers((prev) => {
      const updatedAnswers = { ...prev, [questions[currentQuestion].id]: answer };

      if (shouldFetchRecommendation()) {
        setShowResults(true);
        setHasFetched(true); 
        fetchRecommendation(updatedAnswers);
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }

      return updatedAnswers;
    });
  };

  useEffect(() => {
    console.log('Recommendation updated:', recommendation);
  }, [recommendation]);

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
      }, 300);
    }
  };

  const restartQuiz = () => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setRecommendation(null);
      setHasFetched(false);
      setIsLoading(false);
    }, 300);
  };

  const formatQuestionsAndAnswers = () => {
    return questions.map((q) => ({
      question: q.question,
      answer: answers[q.id] || "Not answered"
    }));
  };

  const sendToOpenAI = async (formattedData: { question: string; answer: string }[]) => {
    const apiKey = 'sk-35oX4YXpcSliiYyLbvzDO_-wDepdR9iODHgANt00_ST3BlbkFJjkwbsIaP6taxKQ-igWszPUlcHguHJZAz37yQC2FZYA'; // Replace with your actual OpenAI API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const prompt = `Въз основа на следните въпроси и отговори за предпочитанията към iPhone, препоръчайте най-добрия модел iPhone и обяснете защо е най-добрият избор. Важно: върнете отговора във формат JSON с три полета: "model", "description" и "price". Следвайте точното форматиране и не добавяйте допълнителни символи извън JSON структурата.

    Примерен формат:
    [
        {
            "model": "iPhone 13 Pro Max",
            "description": "Най-добрият избор за вас е iPhone 13 Pro Max, който предлага високопроизводителен процесор, голям дисплей, много голям капацитет за съхранение и висококачествена камера за снимки и видео. Този модел също така има отлична продуктивност и може да се използва за дълго време благодарение на надеждната батерия.",
            "price": "над 2000 лв."
        }
    ]

    Не променяйте имената на полетата и се уверете, че връщаният JSON е валиден и точно форматиран по примера.'\n\n${JSON.stringify(formattedData, null, 2)}`;
    console.log('Prompt Sent to OpenAI:', prompt);

    setIsLoading(true); // Show loading animation
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const content = data.choices[0].message.content.trim();

        const recommendation = JSON.parse(content);
        return recommendation;
      } else {
        throw new Error('Invalid response format or no choices returned from the API.');
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return null;
    } finally {
      setIsLoading(false); // Hide loading animation
    }
  };

  const getRecommendation = async (formattedData: { question: string; answer: string }[]): Promise<Recommendation> => {
  console.log('Formatted Questions and Answers:', formattedData);
  const openAIResponse = await sendToOpenAI(formattedData);

  if (openAIResponse) {
    // Extract the iPhone number from the model name
    const modelNumber = openAIResponse[0].model.match(/\d+/); // This will extract the first number found in the model string

    // Construct the link based on the extracted model number, defaulting to a base link if no number is found
    const link = modelNumber ? `https://istyle.bg/iphone-${modelNumber[0]}.html` : 'https://istyle.bg/iphone.html';
    // Construct the image path based on the extracted model number, defaulting to a placeholder if no number is found
    const image = modelNumber ? `/images/iphone${modelNumber[0]}.png` : '/images/iphone13.png';
    debugger;
    return {
      model: openAIResponse[0].model,
      description: openAIResponse[0].description,
      price: openAIResponse[0].price,
      image: image,
      link: link,
    };
  } else {
    // Default fallback recommendation
    return {
      model: 'iPhone 13 Pro',
      description: 'Не успяхме да генерираме персонализирана препоръка. iPhone 13 Pro е чудесен избор с отлични функции.',
      price: '2199 лв.',
      image: '/placeholder.svg',
      link: 'https://istyle.bg/iphone-13.html',
    };
  }
};

  // Global variable to track if a fetch is in progress
  let isFetching = false;

  const fetchRecommendation = async (latestAnswers: Record<number, string>) => {
    if (isFetching) return;
  
    isFetching = true;
    setIsLoading(true);

    const formattedData = questions.map((q) => ({
      question: q.question,
      answer: latestAnswers[q.id] || 'Not answered',
    }));
  
    const newRecommendation = await getRecommendation(formattedData);
  
    // Check the recommendation before setting it
    console.log('New Recommendation:', newRecommendation);
  
    setRecommendation(newRecommendation);
  
    // Confirm the state update with a console log
    console.log('Recommendation state after setting:', recommendation);
  
    setIsLoading(false);
    isFetching = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      <header className="py-6 px-4 bg-black bg-opacity-50 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Apple className="w-8 h-8" />
        </div>
      </header>

      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Открийте Вашия Идеален iPhone
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Отговорете на няколко въпроса и ние ще ви препоръчаме най-подходящия iPhone за вашите нужди.
          </p>
          <div className="flex justify-center space-x-24 mb-16"> {/* Increased spacing */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Персонализирано</h3>
              <p className="text-gray-400">Съобразено с вашите нужди</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Бързо</h3>
              <p className="text-gray-400">Само няколко въпроса</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-pink-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Експертно</h3>
              <p className="text-gray-400">Базирано на опит</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute left-1/3 bottom-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      <main className="pb-16 px-4 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out transform hover:shadow-3xl relative z-10">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <div className={`p-8 transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
              {!showResults ? (
                <>
                  <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Намерете Вашия iPhone
                  </h2>
                  <div className="mb-8 bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-100">{questions[currentQuestion].question}</h3>
                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-4 rounded-xl border border-gray-600 hover:border-blue-400 hover:bg-blue-400 hover:bg-opacity-10 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="flex items-center px-6 py-3 bg-gray-700 rounded-full disabled:opacity-50 transition-colors duration-300 hover:bg-gray-600"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Назад
                    </button>
                    <div className="text-sm text-gray-400">
                      {currentQuestion + 1} от {questions.length}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  {recommendation ? (
                    <>
                      <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Вашият идеален iPhone
                      </h2>
                      <div className="flex flex-col items-center">
                        <div className="relative w-64 h-64 mb-8">
                          <img
                            src={recommendation.image}
                            alt={recommendation.model}
                            className="w-full h-full object-cover rounded-3xl shadow-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl"></div>
                        </div>
                        {recommendation && recommendation.model && (
                          <div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-100">{recommendation.model}</h3>
                            <p className="text-gray-300 mb-6 max-w-2xl">{recommendation.description}</p>
                          </div>
                        )}
                        <p className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                          {recommendation.price}
                        </p>
                        <a
                          href={recommendation.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-8"
                        >
                          Купи сега
                        </a>
                      </div>
                    </>
                  ) : (
                    <p>Loading recommendation...</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 px-4 bg-black bg-opacity-50 backdrop-blur-md">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2023 Apple Inc. Всички права запазени.</p>
          <div className="mt-2">
            <a href="#" className="hover:text-gray-300 transition-colors mr-4">Поверителност</a>
            <a href="#" className="hover:text-gray-300 transition-colors mr-4">Правни условия</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Карта на сайта</a>
          </div>
        </div>
      </footer>
    </div>
  );
}