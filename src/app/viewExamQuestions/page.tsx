"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ExamQuestion {
    id: number;
    question: string;
    options: { [key: string]: string };
    score: number;
}

interface ExamPaper {
    id: number;
    add_time: string;
    name: string;
    duration: number;
    status: number;
    description: string;
}

export default function ViewExamQuestions() {
    const [exam, setExam] = useState<ExamPaper | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedExam = localStorage.getItem("selectedExam");
        if (storedExam) {
            const examData: ExamPaper = JSON.parse(storedExam);
            setExam(examData);
            fetchQuestions(examData.id);
        } else {
            window.location.href = "/viewExams";
        }
    }, []);

    const fetchQuestions = async (examPaperID: number) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/examquestionByExamPaperID/${examPaperID}`);
            let questionsData = response.data;

            if (!Array.isArray(questionsData)) {
                questionsData = [questionsData];
            }

            const parsedQuestions = questionsData.map((question: any) => ({
                ...question,
                options: JSON.parse(question.options),
            }));

            setQuestions(parsedQuestions);
        } catch (err) {
            setError("无法获取试题信息，请重试。");
        }
    };

    if (!exam) return null;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="z-10 w-full max-w-4xl items-center justify-center font-mono text-sm">
                <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{exam.name}</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="space-y-6">
                        {Array.isArray(questions) && questions.map((question) => (
                            <div key={question.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">{question.question}</h3>
                                <div className="space-y-2">
                                    {Object.entries(question.options).map(([key, option]) => (
                                        <div key={key} className="block text-gray-700">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={key}
                                                disabled
                                                className="mr-2"
                                            />
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-8">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                            onClick={() => {
                                window.location.href = "/viewExams";
                            }}
                        >
                            返回
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
