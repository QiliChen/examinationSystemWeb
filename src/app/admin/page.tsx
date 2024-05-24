"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface User {
    id: number;
    username: string;
    role: string;
    email: string;
    name: string;
    avatar: string;
    gender: string;
}

interface Student {
    id: number;
    user_id: number;
    student_id: string;
    phone: string;
    id_number: string;
    address: string;
}

interface Teacher {
    id: number;
    user_id: number;
    employee_id: string;
    department: string;
    id_number: string;
}

interface UserAndInfo {
    user: User;
    student?: Student;
    teacher?: Teacher;
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserAndInfo[]>([]);
    const [error, setError] = useState("");
    const [newUser, setNewUser] = useState<Partial<User>>({
        role: "student", // Default role
    });
    const [newStudent, setNewStudent] = useState<Partial<Student>>({});
    const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({});

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        const storedUsername = localStorage.getItem("username");

        if (storedRole && storedUsername) {
            if (storedRole !== "admin") {
                window.location.href = "/"; // Redirect non-admin users
            } else {
                fetchUsers();
            }
        } else {
            window.location.href = "/"; // Redirect unauthenticated users
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8080/getAllUsersAndInfo");
            setUsers(response.data);
        } catch (err) {
            setError("无法获取用户信息，请重试。");
        }
    };

    const handleCreateUser = async () => {
        try {
            const requestData = {
                user: newUser,
                student: newUser.role === "student" ? newStudent : {},
                teacher: newUser.role === "teacher" ? newTeacher : {},
            };

            await axios.post("http://127.0.0.1:8080/createUserWithType", requestData);

            setError("用户创建成功！");
            fetchUsers(); // Refresh the user list
        } catch (err) {
            setError("无法创建用户，请重试。");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("student_id");
        localStorage.removeItem("teacher_id");
        window.location.href = "/";
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
            <div className="z-10 w-full max-w-6xl items-center justify-center font-mono text-sm">
                <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-6 w-full">
                    <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">管理页面</h2>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                    <h3 className="text-xl font-bold mb-4 text-center text-gray-800">所有用户</h3>
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">用户名</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">角色</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">姓名</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">邮箱</th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-gray-600">详细信息</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((userAndInfo, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 border-b border-gray-200">{userAndInfo.user.username}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{userAndInfo.user.role}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{userAndInfo.user.name}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{userAndInfo.user.email}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        {userAndInfo.user.role === "student" && userAndInfo.student && (
                                            <div>
                                                学号: {userAndInfo.student.student_id}, 电话: {userAndInfo.student.phone}
                                            </div>
                                        )}
                                        {userAndInfo.user.role === "teacher" && userAndInfo.teacher && (
                                            <div>
                                                工号: {userAndInfo.teacher.employee_id}, 部门: {userAndInfo.teacher.department}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-xl font-bold mt-8 mb-4 text-center text-gray-800">创建新用户</h3>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">用户名</label>
                        <input
                            type="text"
                            value={newUser.username || ""}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">密码</label>
                        <input
                            type="password"
                            value={newUser.password || ""}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">角色</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="student">学生</option>
                            <option value="teacher">老师</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">姓名</label>
                        <input
                            type="text"
                            value={newUser.name || ""}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">邮箱</label>
                        <input
                            type="email"
                            value={newUser.email || ""}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    {newUser.role === "student" && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">学号</label>
                            <input
                                type="text"
                                value={newStudent.student_id || ""}
                                onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    )}
                    {newUser.role === "teacher" && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">工号</label>
                            <input
                                type="text"
                                value={newTeacher.employee_id || ""}
                                onChange={(e) => setNewTeacher({ ...newTeacher, employee_id: e.target.value })}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    )}
                    <div className="flex justify-center gap-4">
                        <button
                            className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleCreateUser}
                        >
                            创建用户
                        </button>
                        <button
                            className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleLogout}
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
