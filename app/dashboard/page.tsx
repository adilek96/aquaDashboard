"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Fish, Eye, Plus, TrendingUp } from "lucide-react";

import Link from "next/link";
import { getUsers } from "../action/users";
import { getArticles } from "../action/articles";
import { getInhabitants } from "../action/inhabitants";

export default function Dashboard() {
  const [userCount, setUserCount] = useState<number>(0);
  const [articleCount, setArticleCount] = useState<number>(0);
  const [inhabitantCount, setInhabitantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const errorMessages: string[] = [];

      try {
        // Получаем количество пользователей
        const usersResponse = await getUsers(1, 1);
        if (usersResponse.statusCode === 200 && usersResponse.data) {
          setUserCount(usersResponse.data.totalCount || 0);
        } else {
          errorMessages.push(
            `Ошибка загрузки пользователей: ${usersResponse.error}`
          );
        }

        // Получаем количество статей
        const articlesResponse = await getArticles();
        if (articlesResponse.statusCode === 200 && articlesResponse.data) {
          setArticleCount(
            Array.isArray(articlesResponse.data)
              ? articlesResponse.data.length
              : 0
          );
        } else {
          errorMessages.push(
            `Ошибка загрузки статей: ${articlesResponse.error}`
          );
        }

        // Получаем количество обитателей
        const inhabitantsResponse = await getInhabitants();
        if (
          inhabitantsResponse.statusCode === 200 &&
          inhabitantsResponse.data
        ) {
          setInhabitantCount(
            Array.isArray(inhabitantsResponse.data)
              ? inhabitantsResponse.data.length
              : 0
          );
        } else {
          errorMessages.push(
            `Ошибка загрузки обитателей: ${inhabitantsResponse.error}`
          );
        }

        setErrors(errorMessages);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setErrors([
          `Общая ошибка: ${
            error instanceof Error ? error.message : "Неизвестная ошибка"
          }`,
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Панель управления
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать в систему управления AquaDaddy
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/content">
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Ошибки загрузки данных:
          </h3>
          <ul className="text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm">
                • {error}
              </li>
            ))}
          </ul>
          <p className="text-red-600 text-sm mt-2">
            Убедитесь, что API сервер запущен и переменные окружения настроены
            правильно.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статьи</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articleCount}</div>
            <p className="text-xs text-muted-foreground">материалов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Обитатели</CardTitle>
            <Fish className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inhabitantCount}</div>
            <p className="text-xs text-muted-foreground">видов в базе данных</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">зарегистрировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              за все время
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Управление контентом</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/categories">
                  <FileText className="w-6 h-6" />
                  <span>Категории</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/subcategories">
                  <FileText className="w-6 h-6" />
                  <span>Подкатегории</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/content">
                  <FileText className="w-6 h-6" />
                  <span>Статьи</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/inhabitants">
                  <Fish className="w-6 h-6" />
                  <span>Обитатели</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Управление системой</CardTitle>
            <CardDescription>Административные функции</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/users">
                  <Users className="w-6 h-6" />
                  <span>Пользователи</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Link href="/tokens">
                  <FileText className="w-6 h-6" />
                  <span>Токены</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
