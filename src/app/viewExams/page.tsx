"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ExamPaper {
    id: number;
    add_time: string;
    name: string;
    duration: number;
    status: number;
    description: string;
}

export default function ViewExams() {
    const [exams, setExams] = useState<ExamPaper[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8080/exampaper");
            setExams(response.data);
        } catch (err) {
            setError("无法获取考试信息，请重试。");
        }
    };

    const handleExamSelect = (exam: ExamPaper) => {
        localStorage.setItem("selectedExam", JSON.stringify(exam));
        window.location.href = "/viewExamQuestions";
    };

    const handleCreateExam = () => {
        window.location.href = "/createExam";
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="z-10 w-full max-w-4xl items-center justify-center font-mono text-sm">
                <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">选择考试</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {exams.map((exam) => (
                            <div key={exam.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{exam.name}</h3>
                                <p className="text-gray-700 mb-4">{exam.description}</p>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    onClick={() => handleExamSelect(exam)}
                                >
                                    查看试题
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleCreateExam}
                        >
                            出卷
                        </button>

                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => {
                                window.location.href = "/teacher";
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
