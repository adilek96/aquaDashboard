"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Trophy, Save } from "lucide-react";
import {
  AchievementDef,
  createAchievementDef,
  deleteAchievementDef,
  getAchievementDefs,
  updateAchievementDef,
} from "@/app/action/achievements";

const CATEGORIES = ["inhabitants", "plants", "maintenance", "checkins"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  inhabitants: "Обитатели",
  plants: "Растения",
  maintenance: "Обслуживание",
  checkins: "Отметки",
};

const CATEGORY_HINT: Record<string, string> = {
  inhabitants: "Сколько всего обитателей добавлено",
  plants: "Сколько видов растений добавлено",
  maintenance: "Сколько обслуживаний выполнено",
  checkins: "Сколько напоминаний закрыто",
};

export default function AchievementsPage() {
  const [defs, setDefs] = useState<AchievementDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState<string>("inhabitants");
  const [newThreshold, setNewThreshold] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const res = await getAchievementDefs();
    if (res.statusCode === 200 && res.data) {
      setDefs(res.data.defs);
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось загрузить", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const threshold = Number(newThreshold);
    if (!Number.isInteger(threshold) || threshold < 1) {
      toast({ title: "Проверьте порог", description: "Нужно целое число ≥ 1", variant: "destructive" });
      return;
    }
    setCreating(true);
    const res = await createAchievementDef({ category: newCategory, threshold });
    setCreating(false);
    if (res.statusCode === 201 && res.data) {
      toast({ title: "Готово", description: "Награда добавлена" });
      setNewThreshold("");
      load();
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось создать", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/4 rounded bg-muted" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Trophy className="h-7 w-7 text-amber-500" />
            Награды
          </h1>
          <p className="text-muted-foreground">
            Пороги наград за действия пользователей. Ключ формируется автоматически из категории и порога.
          </p>
        </div>
      </div>

      {/* Добавление */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Добавить награду</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-muted-foreground">Категория</label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <label className="mb-1 block text-sm text-muted-foreground">Порог</label>
              <Input
                type="number"
                min={1}
                placeholder="например, 10"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Добавить
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{CATEGORY_HINT[newCategory]}</p>
        </CardContent>
      </Card>

      {/* Списки по категориям */}
      {CATEGORIES.map((category) => {
        const list = defs
          .filter((d) => d.category === category)
          .sort((a, b) => a.threshold - b.threshold);
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              {CATEGORY_LABEL[category]}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {CATEGORY_HINT[category]}
              </span>
            </h2>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет наград в этой категории</p>
            ) : (
              <div className="grid gap-3">
                {list.map((def) => (
                  <AchievementRow key={def.id} def={def} onChanged={load} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AchievementRow({
  def,
  onChanged,
}: {
  def: AchievementDef;
  onChanged: () => void;
}) {
  const [threshold, setThreshold] = useState(String(def.threshold));
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const dirty = Number(threshold) !== def.threshold;

  const save = async () => {
    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 1) {
      toast({ title: "Проверьте порог", description: "Нужно целое число ≥ 1", variant: "destructive" });
      return;
    }
    setBusy(true);
    const res = await updateAchievementDef(def.id, { threshold: value });
    setBusy(false);
    if (res.statusCode === 200) {
      toast({ title: "Сохранено", description: "Порог обновлён" });
      onChanged();
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось сохранить", variant: "destructive" });
    }
  };

  const toggleActive = async (active: boolean) => {
    setBusy(true);
    const res = await updateAchievementDef(def.id, { active });
    setBusy(false);
    if (res.statusCode === 200) {
      onChanged();
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось изменить", variant: "destructive" });
    }
  };

  const remove = async () => {
    if (!confirm(`Удалить награду «${def.key}»? Уже полученные пользователями не пропадут из истории, но перестанут отображаться.`)) {
      return;
    }
    setBusy(true);
    const res = await deleteAchievementDef(def.id);
    setBusy(false);
    if (res.statusCode === 200) {
      toast({ title: "Удалено" });
      onChanged();
    } else {
      toast({ title: "Ошибка", description: res.error || "Не удалось удалить", variant: "destructive" });
    }
  };

  return (
    <Card className={def.active ? undefined : "opacity-60"}>
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <Badge variant="outline" className="font-mono">{def.key}</Badge>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Порог</span>
          <Input
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-24"
            disabled={busy}
          />
          <Button size="sm" variant="outline" onClick={save} disabled={busy || !dirty}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={def.active} onCheckedChange={toggleActive} disabled={busy} />
          {def.active ? "Активна" : "Выключена"}
        </label>

        <Button
          size="icon"
          variant="outline"
          onClick={remove}
          disabled={busy}
          className="ml-auto text-destructive"
          aria-label="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
