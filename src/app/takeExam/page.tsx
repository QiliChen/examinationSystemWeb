"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ExamQuestion {
    id: number;
    question: string;
    options: { [key: string]: string };
    score: number;
    correct_answer: string; // 新增字段，用于计算分数
}

interface ExamPaper {
    id: number;
    add_time: string;
    name: string;
    duration: number;
    status: number;
    description: string;
}

export default function Page() {
    const [exam, setExam] = useState<ExamPaper | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedExam = localStorage.getItem("selectedExam");
        if (storedExam) {
            const examData: ExamPaper = JSON.parse(storedExam);
            setExam(examData);
            fetchQuestions(examData.id);
        } else {
            window.location.href = "/chooseExam";
        }
    }, []);

    const fetchQuestions = async (examPaperID: number) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8080/examquestionByExamPaperID/${examPaperID}`);
            let questionsData = response.data;

            // 检查返回的数据是否是对象，如果是，则转换为数组
            if (!Array.isArray(questionsData)) {
                questionsData = [questionsData];
            }

            // 解析 options 字段
            const parsedQuestions = questionsData.map((question: any) => ({
                ...question,
                options: JSON.parse(question.options),
            }));

            setQuestions(parsedQuestions);
        } catch (err) {
            setError("无法获取试题信息，请重试。");
        }
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        // 计算分数
        let score = 0;
        questions.forEach((question) => {
            if (answers[question.id] === question.correct_answer) {
                score += question.score;
            }
        });

        try {
            const studentIdStr = localStorage.getItem("student_id"); // 假设学生ID存储在localStorage
            if (!studentIdStr) {
                setError("无法获取学生ID，请重新登录");
                return;
            }
            const studentId = parseInt(studentIdStr, 10); // 将字符串转换为整数

            await axios.post("http://127.0.0.1:8080/examscores", {
                student_id: studentId,
                paper_id: exam?.id,
                grading_teacher_id: 0, // 假设没有指定评分老师
                score: score,
                comments: "",
            });
            alert("考试提交成功！");
            window.location.href = "/";
        } catch (err) {
            setError("提交考试失败，请重试。");
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
                                <h3 className="text-xl font-semibold mb-2">{question.question}</h3>
                                <div className="space-y-2">
                                    {Object.entries(question.options).map(([key, option]) => (
                                        <label key={key} className="block text-gray-700">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={key}
                                                onChange={() => handleAnswerChange(question.id, key)}
                                                disabled={submitted}
                                                className="mr-2"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {!submitted && (
                        <div className="flex justify-center mt-6">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                                onClick={handleSubmit}
                            >
                                提交考试
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
