"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [examScores, setExamScores] = useState([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (storedRole && storedUsername) {
      const storedUser = {
        user: { username: storedUsername, role: storedRole },
        student: storedRole === "student" ? { id: localStorage.getItem("student_id") } : null,
      };
      // @ts-ignore
      setUser(storedUser);

      if (storedRole === "student") {
        // @ts-ignore
        fetchExamScores(localStorage.getItem("student_id"));
      } else if (storedRole === "teacher") {
        window.location.href = "/teacher";
      } else if (storedRole === "admin") {
        window.location.href = "/admin";
      }
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8080/login", {
        username,
        password,
      });

      const userData = response.data;
      setUser(userData);

      // 存储角色和用户名到 localStorage
      localStorage.setItem("role", userData.user.role);
      localStorage.setItem("username", userData.user.username);
      if (userData.user.role === "student") {
        localStorage.setItem("student_id", userData.student.id);
        fetchExamScores(userData.student.id);
      } else if (userData.user.role === "teacher") {
        localStorage.setItem("teacher_id", userData.teacher.id);
        window.location.href = "/teacher";
      } else if (userData.user.role === "admin") {
        window.location.href = "/admin";
      }
    } catch (err) {
      // @ts-ignore
      if (err.response) {
        // @ts-ignore
        setError(err.response.data.error);
      } else {
        setError("登录失败，请重试");
      }
    }
  };

  const fetchExamScores = async (userId: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/getExamScoresByStudentID/${userId}`);
      setExamScores(response.data);
    } catch (err) {
      console.error("无法获取成绩信息", err);
    }
  };

  const handleViewPapers = () => {
    // 处理查看考卷入口的逻辑
    console.log("查看考卷入口");
    window.location.href = "/chooseExam";
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("student_id");
    localStorage.removeItem("teacher_id");
    setUser(null);
    setExamScores([]);
  };

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
        <div className="z-10 w-full max-w-4xl items-center justify-center font-mono text-sm">
          <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
            {!user && <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">登录</h2>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {user ? (
                <div>
                  <h3 className="text-2xl font-bold text-center text-gray-800">欢迎, {user.user.username}</h3>
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-center text-gray-700">考试成绩</h4>
                    <div className="overflow-x-auto mt-4">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">试卷名称</th>
                          <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">分数</th>
                          <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">评语</th>
                          <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">时间</th>
                        </tr>
                        </thead>
                        <tbody>
                        {examScores.map((score: any) => (
                            <tr key={score.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 border-b border-gray-200">{score.paper_name}</td>
                              {score.grading_teacher_id === 0 ? (
                                  <>
                                    <td className="py-3 px-4 border-b border-gray-200 text-center" colSpan={2}>待批阅</td>
                                  </>
                              ) : (
                                  <>
                                    <td className="py-3 px-4 border-b border-gray-200">{score.score}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{score.comments}</td>
                                  </>
                              )}
                              <td className="py-3 px-4 border-b border-gray-200">{new Date(score.add_time).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleViewPapers}
                    >
                      进入考试
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                        onClick={handleLogout}
                    >
                      退出登录
                    </button>
                  </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="username"
                    >
                      用户名
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="password"
                    >
                      密码
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                      登录
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </main>
  );
}
