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
    teacher_id: number;
}

interface ExamQuestion {
    id: number;
    question: string;
    options: { [key: string]: string };
    score: number;
    correct_answer: string;
    paper_id?: number;
}

export default function CreateExam() {
    const [examPaper, setExamPaper] = useState<Partial<ExamPaper>>({ teacher_id: 0 });
    const [questions, setQuestions] = useState<Partial<ExamQuestion>[]>([]);
    const [newQuestion, setNewQuestion] = useState<Partial<ExamQuestion>>({
        options: {},
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedTeacherId = localStorage.getItem("teacher_id");
        if (storedTeacherId) {
            setExamPaper((prev) => ({ ...prev, teacher_id: parseInt(storedTeacherId, 10) }));
        }
    }, []);

    const handleAddQuestion = () => {
        setQuestions([...questions, newQuestion]);
        setNewQuestion({ options: {} });
    };

    const formatDateToMySQL = (date: Date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const handleCreateExam = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8080/createExamPaperAQuestion", {
                exam_paper: {
                    ...examPaper,
                    add_time: formatDateToMySQL(new Date()),
                    status: 1,
                    teacher_id: parseInt(localStorage.getItem("teacher_id") || "0", 10),
                },
                exam_questions: questions.map(question => ({
                    ...question,
                    add_time: formatDateToMySQL(new Date()),
                    options: JSON.stringify(question.options), // 序列化 options 字段
                })),
            });

            setMessage("试卷和试题创建成功！");
            setExamPaper({ teacher_id: parseInt(localStorage.getItem("teacher_id") || "0", 10) });
            setQuestions([]);
            // 跳转到 viewExams 页面
            window.location.href = "/viewExams";
        } catch (err) {
            setMessage("创建试卷和试题失败，请重试。");
        }
    };

    const handleQuestionChange = (field: keyof ExamQuestion, value: any) => {
        setNewQuestion({ ...newQuestion, [field]: value });
    };

    const handleOptionChange = (optionKey: string, optionValue: string) => {
        setNewQuestion({
            ...newQuestion,
            options: { ...newQuestion.options, [optionKey]: optionValue },
        });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="z-10 w-full max-w-4xl items-center justify-center font-mono text-sm">
                <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">创建试卷</h2>
                    {message && <p className="text-center mb-4">{message}</p>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">试卷名称</label>
                        <input
                            type="text"
                            value={examPaper.name || ""}
                            onChange={(e) => setExamPaper({ ...examPaper, name: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">描述</label>
                        <textarea
                            value={examPaper.description || ""}
                            onChange={(e) => setExamPaper({ ...examPaper, description: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">时长（分钟）</label>
                        <input
                            type="number"
                            value={examPaper.duration || ""}
                            onChange={(e) => setExamPaper({ ...examPaper, duration: Number(e.target.value) })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800">添加试题</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">题目</label>
                        <input
                            type="text"
                            value={newQuestion.question || ""}
                            onChange={(e) => handleQuestionChange("question", e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">选项</label>
                        {["A", "B", "C", "D"].map((key) => (
                            <div key={key} className="mb-2">
                                <input
                                    type="text"
                                    placeholder={`选项 ${key}`}
                                    value={newQuestion.options![key] || ""}
                                    onChange={(e) => handleOptionChange(key, e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">正确答案</label>
                        <input
                            type="text"
                            value={newQuestion.correct_answer || ""}
                            onChange={(e) => handleQuestionChange("correct_answer", e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">分数</label>
                        <input
                            type="number"
                            value={newQuestion.score || ""}
                            onChange={(e) => handleQuestionChange("score", Number(e.target.value))}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleAddQuestion}
                    >
                        添加试题
                    </button>

                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4 text-center text-gray-800">试题列表</h3>
                        <ul>
                            {questions.map((q, index) => (
                                <li key={index} className="mb-2">
                                    <strong>{q.question}</strong>
                                    <ul>
                                        {q.options &&
                                            Object.entries(q.options).map(([key, value]) => (
                                                <li key={key}>
                                                    {key}: {value}
                                                </li>
                                            ))}
                                    </ul>
                                    <p>正确答案: {q.correct_answer}</p>
                                    <p>分数: {q.score}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleCreateExam}
                        >
                            创建试卷
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
