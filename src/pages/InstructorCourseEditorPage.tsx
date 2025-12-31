import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Tabs, TabPanel } from "../components/ui/Tabs";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";

import type { Quiz, Question, Choice } from "../types/courses";
import {
  instructorListQuizzes,
  instructorCreateQuiz,
  instructorUpdateQuiz,
  instructorDeleteQuiz,
  instructorListQuestions,
  instructorCreateQuestion,
  instructorUpdateQuestion,
  instructorDeleteQuestion,
  instructorListChoices,
  instructorCreateChoice,
  instructorUpdateChoice,
  instructorDeleteChoice,
} from "../services/instructorService";

import type { Course, Module, Lesson } from "../types/courses";
import { getCourseDetail } from "../services/courseService";
import {
  instructorCreateLesson,
  instructorCreateModule,
  instructorDeleteCourse,
  instructorDeleteLesson,
  instructorDeleteModule,
  instructorListLessons,
  instructorListModules,
  instructorUpdateCourse,
  instructorUpdateLesson,
  instructorUpdateModule,
} from "../services/instructorService";

type TabKey = "curso" | "modulos" | "lecciones" | "quizzes";
type LessonTipo = "video" | "texto" | "archivo";

// AJUSTA si tu backend usa otros valores
type CourseEstado = "borrador" | "publicado";
type CourseNivel = "basico" | "intermedio" | "avanzado";

const selectBase =
  "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

export function InstructorCourseEditorPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();

  const toast = useToast();

  const [tab, setTab] = useState<TabKey>("curso");

  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);

  // form curso
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [nivel, setNivel] = useState<CourseNivel>("basico");
  const [duracion, setDuracion] = useState<number>(0);
  const [estado, setEstado] = useState<CourseEstado>("borrador");

  // módulos
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleOrder, setModuleOrder] = useState<number>(1);
  const [creatingModule, setCreatingModule] = useState(false);

  // lecciones
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // ✅ separado: módulo para crear vs módulo para filtrar
  const [createModuleId, setCreateModuleId] = useState<number | "">("");
  const [filterModuleId, setFilterModuleId] = useState<number | "">("");

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState<number>(1);
  const [lessonTipo, setLessonTipo] = useState<LessonTipo>("video");

  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonFile, setLessonFile] = useState<File | null>(null);

  const [creatingLesson, setCreatingLesson] = useState(false);

  // quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizModuleId, setQuizModuleId] = useState<number | "">("");

  // preguntas
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionOrder, setQuestionOrder] = useState<number>(1);

  // opciones
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [choiceText, setChoiceText] = useState("");
  const [choiceCorrect, setChoiceCorrect] = useState(false);


  const orderedModules = useMemo(
    () => modules.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [modules]
  );

  const filteredLessons = useMemo(() => {
    const base = lessons.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    if (!filterModuleId) return base;
    return base.filter((l) => l.module === filterModuleId);
  }, [lessons, filterModuleId]);

  async function loadCourse() {
    if (!courseId) return;
    setLoading(true);
    try {
      const c = await getCourseDetail(courseId);
      setCourse(c);

      document.title = `Editar: ${c.titulo ?? "Curso"} | Instructor`;

      setTitulo(c.titulo ?? "");
      setDescripcion(c.descripcion ?? "");
      setCategoria(c.categoria ?? "");
      setNivel(((c.nivel as CourseNivel) ?? "basico") as CourseNivel);
      setDuracion(Number(c.duracion ?? 0));
      setEstado(((c.estado as CourseEstado) ?? "borrador") as CourseEstado);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo cargar el curso."), "Instructor");
    } finally {
      setLoading(false);
    }
  }

  async function loadModules() {
    if (!courseId) return;
    setLoadingModules(true);
    try {
      const data = await instructorListModules({ course_id: courseId });
      setModules(data.filter((m) => m.course === courseId));
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudieron cargar los módulos."), "Instructor");
    } finally {
      setLoadingModules(false);
    }
  }

  async function loadLessons(mods?: Module[]) {
    if (!courseId) return;
    setLoadingLessons(true);
    try {
      const data = await instructorListLessons({ course_id: courseId });
      const effectiveModules = mods ?? modules;
      const moduleIds = new Set(effectiveModules.map((m) => m.id));
      const filtered = data.filter((l) => moduleIds.size === 0 || moduleIds.has(l.module));
      setLessons(filtered);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudieron cargar las lecciones."), "Instructor");
    } finally {
      setLoadingLessons(false);
    }
  }
  async function loadQuizzes() {
    if (!courseId) return;
    setLoadingQuizzes(true);
    try {
      const data = await instructorListQuizzes({ course_id: courseId });
      setQuizzes(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudieron cargar los quizzes."), "Instructor");
    } finally {
      setLoadingQuizzes(false);
    }
  }

  async function loadQuestions(quizId: number) {
    setLoadingQuestions(true);
    try {
      const data = await instructorListQuestions({ quiz_id: quizId });
      setQuestions(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudieron cargar las preguntas."), "Instructor");
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function loadChoices(questionId: number) {
    setLoadingChoices(true);
    try {
      const data = await instructorListChoices({ question_id: questionId });
      setChoices(data);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudieron cargar las opciones."), "Instructor");
    } finally {
      setLoadingChoices(false);
    }
  }


  useEffect(() => {
    // reset básico al cambiar de curso
    setCourse(null);
    setModules([]);
    setLessons([]);
    setTab("curso");
    setCreateModuleId("");
    setFilterModuleId("");
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (tab === "modulos") loadModules();
    if (tab === "lecciones") {
      (async () => {
        await loadModules();
        const mods = await instructorListModules({ course_id: courseId }).catch(() => []);
        setModules(mods.filter((m) => m.course === courseId));
        await loadLessons(mods as Module[]);
      })();
    }
    if (tab === "quizzes") {
      (async () => {
        await loadModules();
        await loadQuizzes();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);


  async function onSaveCourse() {
    if (!courseId) return;
    setSavingCourse(true);
    try {
      const updated = await instructorUpdateCourse(courseId, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        nivel,
        duracion: Number(duracion) || 0,
        estado,
      });
      setCourse(updated);
      toast.success("Curso actualizado.", "Instructor");
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo guardar el curso."), "Instructor");
    } finally {
      setSavingCourse(false);
    }
  }

  async function onDeleteCourse() {
    if (!courseId) return;
    const ok = confirm("¿Eliminar este curso? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      await instructorDeleteCourse(courseId);
      toast.success("Curso eliminado.", "Instructor");
      navigate("/instructor/courses", { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar."), "Instructor");
    }
  }

  async function onCreateModule() {
    if (!courseId) return;
    if (!moduleTitle.trim()) return;

    setCreatingModule(true);
    try {
      await instructorCreateModule({
        course: courseId,
        titulo: moduleTitle.trim(),
        orden: Number(moduleOrder) || 0,
      });
      setModuleTitle("");
      setModuleOrder(1);
      toast.success("Módulo creado.", "Instructor");
      await loadModules();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo crear el módulo."), "Instructor");
    } finally {
      setCreatingModule(false);
    }
  }

  async function onUpdateModule(m: Module) {
    const newTitle = prompt("Nuevo título del módulo:", m.titulo);
    if (newTitle === null) return;

    try {
      await instructorUpdateModule(m.id, { titulo: newTitle.trim() });
      toast.success("Módulo actualizado.", "Instructor");
      await loadModules();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar el módulo."), "Instructor");
    }
  }

  async function onDeleteModule(m: Module) {
    const ok = confirm("¿Eliminar este módulo?");
    if (!ok) return;

    try {
      await instructorDeleteModule(m.id);
      toast.success("Módulo eliminado.", "Instructor");
      await loadModules();
      await loadLessons();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar el módulo."), "Instructor");
    }
  }

  function resetLessonFields() {
    setLessonTitle("");
    setLessonOrder(1);
    setLessonTipo("video");
    setLessonVideoUrl("");
    setLessonContent("");
    setLessonFile(null);
  }

  async function onCreateLesson() {
    if (!createModuleId) {
      toast.error("Selecciona un módulo para crear la lección.", "Instructor");
      return;
    }
    if (!lessonTitle.trim()) return;

    if (lessonTipo === "video" && !lessonVideoUrl.trim()) {
      toast.error("url_video es obligatorio cuando tipo=video.", "Instructor");
      return;
    }
    if (lessonTipo === "texto" && !lessonContent.trim()) {
      toast.error("contenido es obligatorio cuando tipo=texto.", "Instructor");
      return;
    }
    if (lessonTipo === "archivo") {
      if (!lessonFile) {
        toast.error("archivo es obligatorio cuando tipo=archivo.", "Instructor");
        return;
      }
      if (!lessonFile.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Solo se permite PDF.", "Instructor");
        return;
      }
    }

    setCreatingLesson(true);
    try {
      if (lessonTipo === "video") {
        await instructorCreateLesson({
          module: createModuleId,
          titulo: lessonTitle.trim(),
          tipo: "video",
          orden: Number(lessonOrder) || 0,
          url_video: lessonVideoUrl.trim(),
        });
      } else if (lessonTipo === "texto") {
        await instructorCreateLesson({
          module: createModuleId,
          titulo: lessonTitle.trim(),
          tipo: "texto",
          orden: Number(lessonOrder) || 0,
          contenido: lessonContent.trim(),
        });
      } else {
        await instructorCreateLesson({
          module: createModuleId,
          titulo: lessonTitle.trim(),
          tipo: "archivo",
          orden: Number(lessonOrder) || 0,
          archivo: lessonFile!,
        });
      }

      toast.success("Lección creada.", "Instructor");
      resetLessonFields();
      await loadLessons();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo crear la lección."), "Instructor");
    } finally {
      setCreatingLesson(false);
    }
  }

  async function onUpdateLesson(l: Lesson) {
    const newTitle = prompt("Nuevo título de la lección:", l.titulo);
    if (newTitle === null) return;

    try {
      await instructorUpdateLesson(l.id, { titulo: newTitle.trim() });
      toast.success("Lección actualizada.", "Instructor");
      await loadLessons();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar la lección."), "Instructor");
    }
  }

  async function onReplaceLessonPdf(l: Lesson) {
    const ok = confirm("Vas a reemplazar el PDF de esta lección. ¿Continuar?");
    if (!ok) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Solo se permite PDF.", "Instructor");
        return;
      }

      try {
        await instructorUpdateLesson(l.id, { archivo: file });
        toast.success("PDF actualizado.", "Instructor");
        await loadLessons();
      } catch (e) {
        toast.error(getErrorMessage(e, "No se pudo actualizar el PDF."), "Instructor");
      }
    };
    input.click();
  }

  async function onDeleteLesson(l: Lesson) {
    const ok = confirm("¿Eliminar esta lección?");
    if (!ok) return;

    try {
      await instructorDeleteLesson(l.id);
      toast.success("Lección eliminada.", "Instructor");
      await loadLessons();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar la lección."), "Instructor");
    }
  }
  async function onCreateQuiz() {
    if (!quizTitle.trim()) return;

    try {
      await instructorCreateQuiz({
        course: quizModuleId ? null : courseId,
        module: quizModuleId || null,
        titulo: quizTitle.trim(),
        descripcion: quizDescription.trim() || undefined,
      });
      toast.success("Quiz creado.", "Instructor");
      setQuizTitle("");
      setQuizDescription("");
      setQuizModuleId("");
      await loadQuizzes();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo crear el quiz."), "Instructor");
    }
  }

  async function onUpdateQuiz(q: Quiz) {
    const newTitle = prompt("Nuevo título del quiz:", q.titulo);
    if (newTitle === null) return;
    try {
      await instructorUpdateQuiz(q.id, { titulo: newTitle.trim() });
      toast.success("Quiz actualizado.", "Instructor");
      await loadQuizzes();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar el quiz."), "Instructor");
    }
  }

  async function onDeleteQuiz(q: Quiz) {
    const ok = confirm("¿Eliminar este quiz y sus preguntas/opciones?");
    if (!ok) return;
    try {
      await instructorDeleteQuiz(q.id);
      toast.success("Quiz eliminado.", "Instructor");
      setSelectedQuizId((prev) => (prev === q.id ? null : prev));
      setQuestions([]);
      setChoices([]);
      await loadQuizzes();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar el quiz."), "Instructor");
    }
  }

  async function onCreateQuestion() {
    if (!selectedQuizId) {
      toast.error("Selecciona un quiz para crear preguntas.", "Instructor");
      return;
    }
    if (!questionText.trim()) return;

    try {
      await instructorCreateQuestion({
        quiz: selectedQuizId,
        texto: questionText.trim(),
        orden: Number(questionOrder) || 0,
      });
      toast.success("Pregunta creada.", "Instructor");
      setQuestionText("");
      setQuestionOrder(1);
      await loadQuestions(selectedQuizId);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo crear la pregunta."), "Instructor");
    }
  }

  async function onUpdateQuestion(q: Question) {
    const newText = prompt("Nuevo texto de la pregunta:", q.texto);
    if (newText === null) return;
    try {
      await instructorUpdateQuestion(q.id, { texto: newText.trim() });
      toast.success("Pregunta actualizada.", "Instructor");
      if (selectedQuizId) await loadQuestions(selectedQuizId);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar la pregunta."), "Instructor");
    }
  }

  async function onDeleteQuestion(q: Question) {
    const ok = confirm("¿Eliminar esta pregunta y sus opciones?");
    if (!ok) return;
    try {
      await instructorDeleteQuestion(q.id);
      toast.success("Pregunta eliminada.", "Instructor");
      if (selectedQuizId) await loadQuestions(selectedQuizId);
      if (selectedQuestionId === q.id) {
        setSelectedQuestionId(null);
        setChoices([]);
      }
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar la pregunta."), "Instructor");
    }
  }

  async function onCreateChoice() {
    if (!selectedQuestionId) {
      toast.error("Selecciona una pregunta para crear opciones.", "Instructor");
      return;
    }
    if (!choiceText.trim()) return;

    try {
      await instructorCreateChoice({
        question: selectedQuestionId,
        texto: choiceText.trim(),
        correcta: choiceCorrect,
      });
      toast.success("Opción creada.", "Instructor");
      setChoiceText("");
      setChoiceCorrect(false);
      await loadChoices(selectedQuestionId);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo crear la opción."), "Instructor");
    }
  }

  async function onUpdateChoice(c: Choice) {
    const newText = prompt("Nuevo texto de la opción:", c.texto);
    if (newText === null) return;
    try {
      await instructorUpdateChoice(c.id, { texto: newText.trim() });
      toast.success("Opción actualizada.", "Instructor");
      if (selectedQuestionId) await loadChoices(selectedQuestionId);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar la opción."), "Instructor");
    }
  }

  async function onToggleChoiceCorrect(c: Choice) {
    try {
      await instructorUpdateChoice(c.id, { correcta: !c.correcta });
      await loadChoices(c.question);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo actualizar la opción."), "Instructor");
    }
  }

  async function onDeleteChoice(c: Choice) {
    const ok = confirm("¿Eliminar esta opción?");
    if (!ok) return;
    try {
      await instructorDeleteChoice(c.id);
      toast.success("Opción eliminada.", "Instructor");
      if (selectedQuestionId) await loadChoices(selectedQuestionId);
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo eliminar la opción."), "Instructor");
    }
  }


  if (loading) return <div className="card text-left">Cargando editor…</div>;
  if (!course) return <div className="card text-left">No se encontró el curso.</div>;

  return (
    <div className="space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Editar curso</h1>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{course.titulo}</span>{" "}
            • ID {course.id}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/instructor/courses">
            <Button variant="secondary">Volver</Button>
          </Link>
          <Button variant="danger" onClick={onDeleteCourse}>
            Eliminar
          </Button>
          <Link to={`/courses/${course.id}`}>
            <Button>Ver público</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs<TabKey>
        value={tab}
        onChange={setTab}
        items={[
          { key: "curso", label: "Curso" },
          { key: "modulos", label: "Módulos" },
          { key: "lecciones", label: "Lecciones" },
          { key: "quizzes", label: "Quizzes" },
        ]}
      />

      <div>
        {/* TAB: CURSO */}
        <TabPanel tabKey="curso" activeKey={tab}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-slate-700">Título</div>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-slate-700">
                Descripción
              </div>
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">
                Categoría
              </div>
              <Input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">Nivel</div>
              <select
                className={selectBase}
                value={nivel}
                onChange={(e) =>
                  setNivel(e.target.value as CourseNivel)
                }
              >
                <option value="basico">basico</option>
                <option value="intermedio">intermedio</option>
                <option value="avanzado">avanzado</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">
                Duración (min)
              </div>
              <Input
                type="number"
                value={duracion}
                onChange={(e) =>
                  setDuracion(Number(e.target.value))
                }
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">Estado</div>
              <select
                className={selectBase}
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value as CourseEstado)
                }
              >
                <option value="borrador">borrador</option>
                <option value="publicado">publicado</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-2 pt-2">
              <Button
                onClick={onSaveCourse}
                disabled={savingCourse || !titulo.trim()}
              >
                Guardar cambios
              </Button>
              <Button
                variant="secondary"
                onClick={loadCourse}
                disabled={savingCourse}
              >
                Recargar
              </Button>
            </div>
          </div>
        </TabPanel>

        {/* TAB: MÓDULOS */}
        <TabPanel tabKey="modulos" activeKey={tab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Módulos
              </div>
              <Button
                variant="secondary"
                onClick={loadModules}
                disabled={loadingModules}
              >
                Recargar
              </Button>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Crear módulo
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Título del módulo"
                  className="sm:col-span-2"
                />
                <Input
                  type="number"
                  value={moduleOrder}
                  onChange={(e) =>
                    setModuleOrder(Number(e.target.value))
                  }
                  placeholder="Orden"
                />
                <div className="sm:col-span-3">
                  <Button
                    onClick={onCreateModule}
                    disabled={
                      creatingModule || !moduleTitle.trim()
                    }
                  >
                    Crear módulo
                  </Button>
                </div>
              </div>
            </div>

            {loadingModules ? (
              <div className="card">Cargando módulos…</div>
            ) : orderedModules.length === 0 ? (
              <div className="card">Aún no hay módulos.</div>
            ) : (
              <div className="space-y-2">
                {orderedModules.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {m.titulo}
                        </div>
                        <div className="text-xs text-slate-500">
                          Orden: {m.orden ?? 0}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => onUpdateModule(m)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => onDeleteModule(m)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* TAB: LECCIONES */}
        <TabPanel tabKey="lecciones" activeKey={tab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Lecciones
              </div>
              <Button
                variant="secondary"
                onClick={async () => {
                  await loadModules();
                  await loadLessons();
                }}
                disabled={loadingLessons}
              >
                Recargar
              </Button>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Crear lección
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  className={`${selectBase} sm:col-span-1`}
                  value={createModuleId}
                  onChange={(e) =>
                    setCreateModuleId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">Selecciona módulo</option>
                  {orderedModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titulo}
                    </option>
                  ))}
                </select>

                <Input
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Título de la lección"
                  className="sm:col-span-2"
                />

                <Input
                  type="number"
                  value={lessonOrder}
                  onChange={(e) =>
                    setLessonOrder(Number(e.target.value))
                  }
                  placeholder="Orden"
                />

                <select
                  className={`${selectBase} sm:col-span-2`}
                  value={lessonTipo}
                  onChange={(e) =>
                    setLessonTipo(e.target.value as LessonTipo)
                  }
                >
                  <option value="video">video</option>
                  <option value="texto">texto</option>
                  <option value="archivo">archivo (PDF)</option>
                </select>

                {lessonTipo === "video" && (
                  <div className="sm:col-span-3">
                    <Input
                      value={lessonVideoUrl}
                      onChange={(e) =>
                        setLessonVideoUrl(e.target.value)
                      }
                      placeholder="url_video (obligatorio)"
                    />
                  </div>
                )}

                {lessonTipo === "texto" && (
                  <div className="sm:col-span-3">
                    <textarea
                      className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
                      value={lessonContent}
                      onChange={(e) =>
                        setLessonContent(e.target.value)
                      }
                      placeholder="contenido (obligatorio)"
                    />
                  </div>
                )}

                {lessonTipo === "archivo" && (
                  <div className="sm:col-span-3 space-y-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setLessonFile(e.target.files?.[0] ?? null)
                      }
                    />
                    <div className="text-xs text-slate-600">
                      Archivo seleccionado:{" "}
                      {lessonFile ? lessonFile.name : "Ninguno"}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-3 flex gap-2">
                  <Button
                    onClick={onCreateLesson}
                    disabled={
                      creatingLesson ||
                      !lessonTitle.trim() ||
                      !createModuleId
                    }
                  >
                    Crear lección
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetLessonFields}
                    disabled={creatingLesson}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-700">
                Filtrar por módulo:
              </div>
              <select
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
                value={filterModuleId}
                onChange={(e) =>
                  setFilterModuleId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Todos</option>
                {orderedModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
              </select>
            </div>

            {loadingLessons ? (
              <div className="card">Cargando lecciones…</div>
            ) : filteredLessons.length === 0 ? (
              <div className="card">
                No hay lecciones para este filtro.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLessons.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {l.titulo}
                        </div>
                        <div className="text-xs text-slate-500">
                          Módulo #{l.module} • Orden {l.orden ?? 0} •
                          Tipo {l.tipo}
                          {l.tipo === "video" && l.url_video
                            ? " • Con video"
                            : ""}
                          {l.tipo === "archivo" && l.archivo
                            ? " • Con PDF"
                            : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => onUpdateLesson(l)}
                        >
                          Editar título
                        </Button>

                        {l.tipo === "archivo" && (
                          <Button
                            variant="secondary"
                            onClick={() => onReplaceLessonPdf(l)}
                          >
                            Reemplazar PDF
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          onClick={() => onDeleteLesson(l)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {l.tipo === "video" && l.url_video && (
                      <a
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                        href={l.url_video}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir video
                      </a>
                    )}

                    {l.tipo === "archivo" && l.archivo && (
                      <a
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                        href={l.archivo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* TAB: QUIZZES */}
        <TabPanel tabKey="quizzes" activeKey={tab}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Quizzes
              </div>
              <Button
                variant="secondary"
                onClick={loadQuizzes}
                disabled={loadingQuizzes}
              >
                Recargar
              </Button>
            </div>

            {/* Crear quiz */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">
                Crear quiz
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  className={`${selectBase} sm:col-span-1`}
                  value={quizModuleId}
                  onChange={(e) =>
                    setQuizModuleId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">
                    (Solo curso completo)
                  </option>
                  {orderedModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.titulo}
                    </option>
                  ))}
                </select>

                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Título del quiz"
                  className="sm:col-span-2"
                />

                <div className="sm:col-span-3">
                  <Input
                    value={quizDescription}
                    onChange={(e) =>
                      setQuizDescription(e.target.value)
                    }
                    placeholder="Descripción (opcional)"
                  />
                </div>

                <div className="sm:col-span-3 flex gap-2">
                  <Button
                    onClick={onCreateQuiz}
                    disabled={!quizTitle.trim()}
                  >
                    Crear quiz
                  </Button>
                </div>
              </div>
            </div>

            {/* Listado de quizzes */}
            {loadingQuizzes ? (
              <div className="card">Cargando quizzes…</div>
            ) : quizzes.length === 0 ? (
              <div className="card">
                Aún no hay quizzes para este curso.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">
                {/* Columna izquierda: quizzes y preguntas */}
                <div className="space-y-3">
                  {quizzes.map((q) => (
                    <div
                      key={q.id}
                      className={
                        "rounded-xl border bg-white p-3 shadow-sm " +
                        (selectedQuizId === q.id
                          ? "border-blue-500"
                          : "border-slate-200")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="min-w-0 cursor-pointer"
                          onClick={async () => {
                            setSelectedQuizId(q.id);
                            setSelectedQuestionId(null);
                            setChoices([]);
                            await loadQuestions(q.id);
                          }}
                        >
                          <div className="text-sm font-semibold text-slate-900">
                            {q.titulo}
                          </div>
                          <div className="text-xs text-slate-500">
                            {q.descripcion || "Sin descripción"} •{" "}
                            {q.module
                              ? `Módulo #${q.module}`
                              : "Nivel curso"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => onUpdateQuiz(q)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => onDeleteQuiz(q)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      {/* Preguntas del quiz seleccionado */}
                      {selectedQuizId === q.id && (
                        <div className="mt-3 space-y-3">
                          {/* Crear pregunta */}
                          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="text-xs font-semibold text-slate-700">
                              Crear pregunta
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3">
                              <Input
                                value={questionText}
                                onChange={(e) =>
                                  setQuestionText(e.target.value)
                                }
                                placeholder="Texto de la pregunta"
                                className="sm:col-span-2"
                              />
                              <Input
                                type="number"
                                value={questionOrder}
                                onChange={(e) =>
                                  setQuestionOrder(
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Orden"
                              />
                              <div className="sm:col-span-3 flex gap-2">
                                <Button
                                  onClick={onCreateQuestion}
                                  disabled={!questionText.trim()}
                                >
                                  Agregar pregunta
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Listado de preguntas */}
                          {loadingQuestions ? (
                            <div className="text-xs text-slate-600">
                              Cargando preguntas…
                            </div>
                          ) : questions.length === 0 ? (
                            <div className="text-xs text-slate-600">
                              Aún no hay preguntas en este quiz.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {questions.map((qq) => (
                                <div
                                  key={qq.id}
                                  className={
                                    "rounded-lg border bg-white p-3 shadow-sm " +
                                    (selectedQuestionId === qq.id
                                      ? "border-emerald-500"
                                      : "border-slate-200")
                                  }
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div
                                      className="min-w-0 cursor-pointer"
                                      onClick={async () => {
                                        setSelectedQuestionId(qq.id);
                                        await loadChoices(qq.id);
                                      }}
                                    >
                                      <div className="text-sm font-semibold text-slate-900">
                                        {qq.texto}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Orden {qq.orden}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="secondary"
                                        onClick={() =>
                                          onUpdateQuestion(qq)
                                        }
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        onClick={() =>
                                          onDeleteQuestion(qq)
                                        }
                                      >
                                        Eliminar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Columna derecha: opciones */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {!selectedQuestionId ? (
                    <div className="text-sm text-slate-600">
                      Selecciona una pregunta para gestionar sus
                      opciones.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-900">
                        Opciones de la pregunta seleccionada
                      </div>

                      {/* Crear opción */}
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                        <div className="text-xs font-semibold text-slate-700">
                          Crear opción
                        </div>
                        <Input
                          value={choiceText}
                          onChange={(e) =>
                            setChoiceText(e.target.value)
                          }
                          placeholder="Texto de la opción"
                        />
                        <label className="flex items-center gap-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={choiceCorrect}
                            onChange={(e) =>
                              setChoiceCorrect(e.target.checked)
                            }
                          />
                          Marcar como correcta
                        </label>
                        <div>
                          <Button
                            onClick={onCreateChoice}
                            disabled={!choiceText.trim()}
                          >
                            Agregar opción
                          </Button>
                        </div>
                      </div>

                      {/* Listado de opciones */}
                      {loadingChoices ? (
                        <div className="text-xs text-slate-600">
                          Cargando opciones…
                        </div>
                      ) : choices.length === 0 ? (
                        <div className="text-xs text-slate-600">
                          Aún no hay opciones para esta pregunta.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {choices.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-slate-900">
                                  {c.texto}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {c.correcta
                                    ? "Correcta"
                                    : "Incorrecta"}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="secondary"
                                  onClick={() =>
                                    onToggleChoiceCorrect(c)
                                  }
                                >
                                  {c.correcta
                                    ? "Marcar incorrecta"
                                    : "Marcar correcta"}
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => onUpdateChoice(c)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="secondary"
                                  onClick={() => onDeleteChoice(c)}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
