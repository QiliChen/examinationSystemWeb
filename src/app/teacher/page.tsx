"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ExamScore {
    id: number;
    paper_id: number;
    paper_name: string;
    student_name: string;
    student_id: number;
    grading_teacher_id: number;
    comments: string;
    score: number;
    add_time: string;
}

interface GradeExamRequest {
    student_id: number;
    paper_id: number;
    grading_teacher_id: number;
    comments: string;
    score: number;
    score_id: number;
}

export default function Teacher() {
    const [examScores, setExamScores] = useState<ExamScore[]>([]);
    const [error, setError] = useState("");
    const [selectedScore, setSelectedScore] = useState<ExamScore | null>(null);
    const [gradingComments, setGradingComments] = useState("");
    const [showGradingModal, setShowGradingModal] = useState(false);

    useEffect(() => {
        fetchExamScores();
    }, []);

    const fetchExamScores = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8080/getAllStudentScores");
            setExamScores(response.data);
        } catch (err) {
            console.error("无法获取成绩信息", err);
            setError("无法获取成绩信息，请重试。");
        }
    };

    const handleReview = (score: ExamScore) => {
        setSelectedScore(score);
        setGradingComments(score.comments || "");
        setShowGradingModal(true);
    };

    const handleSubmitGrading = async () => {
        if (!selectedScore) return;

        const gradeExamRequest: GradeExamRequest = {
            student_id: selectedScore.student_id,
            paper_id: selectedScore.paper_id,
            grading_teacher_id: parseInt(localStorage.getItem("teacher_id") || "1"),
            comments: gradingComments,
            score: selectedScore.score,
            score_id: selectedScore.id,
        };

        try {
            await axios.post("http://127.0.0.1:8080/gradeExam", gradeExamRequest);
            alert("批改成功！");
            setShowGradingModal(false);
            fetchExamScores(); // Refresh the scores list
        } catch (err) {
            console.error("无法提交批改信息", err);
            alert("无法提交批改信息，请重试。");
        }
    };

    const handleCloseModal = () => {
        setShowGradingModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("student_id");
        localStorage.removeItem("teacher_id");
        window.location.href = "/";
    };



    const handleViewExams = () => {
        window.location.href = "/viewExams";
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="z-10 w-full max-w-6xl items-center justify-center font-mono text-sm">
                <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
                    <div className="flex  mb-6 content-center">
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleViewExams}
                        >
                            查看试卷
                        </button>

                        <div className="flex-grow"></div>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleLogout}
                        >
                            退出登录
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">教师页面</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">学生姓名</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">试卷名称</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">时间</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">分数</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">评语</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {examScores.map((score: ExamScore) => (
                                <tr key={score.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b border-gray-200">{score.student_name}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{score.paper_name}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{new Date(score.add_time).toLocaleString()}</td>
                                    {score.grading_teacher_id === 0 ? (
                                        <>
                                            <td className="py-3 px-4 border-b border-gray-200 text-center" colSpan={2}>待批阅</td>
                                            <td className="py-3 px-4 border-b border-gray-200">
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                                    onClick={() => handleReview(score)}
                                                >
                                                    阅卷
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="py-3 px-4 border-b border-gray-200">{score.score}</td>
                                            <td className="py-3 px-4 border-b border-gray-200">{score.comments}</td>
                                            <td className="py-3 px-4 border-b border-gray-200"></td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showGradingModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg z-60">
                        <h3 className="text-2xl font-bold mb-4">批改试卷</h3>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gradingScore">
                                分数
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="gradingScore"
                                type="number"
                                value={selectedScore ? selectedScore.score : ""}
                                readOnly
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gradingComments">
                                评语
                            </label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="gradingComments"
                                value={gradingComments}
                                onChange={(e) => setGradingComments(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCloseModal}
                            >
                                关闭
                            </button>
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleSubmitGrading}
                            >
                                提交
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
