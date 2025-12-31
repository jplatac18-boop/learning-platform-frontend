import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Tabs, TabPanel } from "../components/ui/Tabs";
import { AccordionItem } from "../components/ui/Accordion";
import { useToast } from "../components/ui/ToastProvider";

import type { Course, Lesson, Module } from "../types/courses";
import type { Comment } from "../types/feedback";
import type { Enrollment } from "../types/enrollments";

import {
  getCourseDetail,
  studentListModules,
  studentListLessons,
} from "../services/courseService";
import {
  enroll,
  markLessonCompleted,
  myEnrollments,
  lessonProgressByCourse,
} from "../services/enrollmentService";
import {
  createComment,
  listComments,
  rateCourse,
  ratingSummary,
} from "../services/feedbackService";
import { getErrorMessage } from "../services/errors";
import { useAuth } from "../hooks/useAuth";

type TabKey = "contenido" | "comentarios" | "resumen";

export function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);

  const toast = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [tab, setTab] = useState<TabKey>("contenido");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const enrolled = useMemo(
    () => enrollments.some((e) => e.course === courseId && e.estado === "activo"),
    [enrollments, courseId]
  );

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(
    () => new Set()
  );

  // NUEVO: lección seleccionada
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [myRating, setMyRating] = useState<number>(0);
  const [ratingBusy, setRatingBusy] = useState(false);

  const [contentError, setContentError] = useState<string | null>(null);

  // reset cuando cambia el curso
  useEffect(() => {
    setCourse(null);
    setModules([]);
    setLessons([]);
    setComments([]);
    setAvgRating(null);
    setRatingsCount(0);
    setMyRating(0);
    setCompletedLessonIds(new Set());
    setSelectedLessonId(null);
    setTab("contenido");
  }, [courseId]);

  // detalle del curso
  useEffect(() => {
    if (!courseId) return;

    setLoadingCourse(true);
    getCourseDetail(courseId)
      .then((c) => {
        setCourse(c);
        document.title = `${c.titulo} | Learning Platform`;
      })
      .catch((e) => toast.error(getErrorMessage(e), "Curso"))
      .finally(() => setLoadingCourse(false));
  }, [courseId, toast]);

  // inscripciones del usuario
  useEffect(() => {
    if (!user) return;
    myEnrollments()
      .then(setEnrollments)
      .catch(() => {});
  }, [user]);

  async function loadContent() {
    if (!courseId) return;
    setLoadingContent(true);
    setContentError(null);

    try {
      const [m, l, progress] = await Promise.all([
        studentListModules(courseId),
        studentListLessons(courseId),
        user && enrolled ? lessonProgressByCourse(courseId) : Promise.resolve([]),
      ]);

      setModules(m);
      setLessons(l);

      const completed = new Set<number>();
      for (const p of progress as { lesson: number; completado: boolean }[]) {
        if (p.completado) completed.add(p.lesson);
      }
      setCompletedLessonIds(completed);

      // Si no hay lección seleccionada, elegir automáticamente la primera
      if (!selectedLessonId && l.length > 0) {
        setSelectedLessonId(l[0].id);
      }
    } catch (e: any) {
      if (e?.message === "no_enrollment") {
        setContentError("no_enrollment");
      } else {
        setContentError("generic");
        toast.error(getErrorMessage(e), "Contenido");
      }
    } finally {
      setLoadingContent(false);
    }
  }

  async function loadComments() {
    if (!courseId) return;
    setLoadingComments(true);
    try {
      const data = await listComments({ course_id: courseId });
      setComments(data);
    } catch (e) {
      toast.error(getErrorMessage(e), "Comentarios");
    } finally {
      setLoadingComments(false);
    }
  }

  async function loadRatingSummary() {
    if (!courseId) return;
    try {
      const s = await ratingSummary(courseId);
      setAvgRating(s.avg_rating);
      setRatingsCount(s.ratings_count);
    } catch {
      // silencioso
    }
  }

  // carga según pestaña
  useEffect(() => {
    if (tab === "contenido") loadContent();
    if (tab === "comentarios") loadComments();
    if (tab === "resumen") loadRatingSummary();
  }, [tab, courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onEnroll() {
    if (!courseId) return;
    try {
      await enroll(courseId);
      toast.success("Inscripción realizada.", "Cursos");
      if (user) setEnrollments(await myEnrollments());
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo inscribir."), "Cursos");
    }
  }

  async function onCompleteLesson(lesson_id: number) {
    try {
      await markLessonCompleted(lesson_id);
      setCompletedLessonIds((prev) => new Set(prev).add(lesson_id));
      toast.success("Lección completada.", "Progreso");
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo marcar completada."), "Progreso");
    }
  }

  async function onPostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      await createComment({ course: courseId, texto: commentText.trim() });
      setCommentText("");
      toast.success("Comentario publicado.", "Comentarios");
      await loadComments();
    } catch (e2) {
      toast.error(
        getErrorMessage(e2, "No se pudo publicar el comentario."),
        "Comentarios"
      );
    } finally {
      setPostingComment(false);
    }
  }

  async function onRate(v: number) {
    if (!courseId) return;
    setRatingBusy(true);
    try {
      await rateCourse({ course_id: courseId, rating: v });
      setMyRating(v);
      toast.success("Calificación guardada.", "Rating");
      await loadRatingSummary();
    } catch (e) {
      toast.error(getErrorMessage(e, "No se pudo calificar."), "Rating");
    } finally {
      setRatingBusy(false);
    }
  }

  // lección actualmente seleccionada
  const selectedLesson: Lesson | undefined = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId),
    [lessons, selectedLessonId]
  );

  if (loadingCourse) return <div className="card text-left">Cargando curso…</div>;
  if (!course) return <div className="card text-left">No se encontró el curso.</div>;

  return (
    <div className="space-y-6">
      {/* Cabecera del curso */}
      <div className="card text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-slate-900">{course.titulo}</h1>
            <p className="mt-2">{course.descripcion}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                {course.categoria}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                {course.nivel}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                {course.duracion} min
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!user ? (
              <Button variant="secondary" disabled>
                Inicia sesión para inscribirte
              </Button>
            ) : enrolled ? (
              <Button variant="secondary" disabled>
                Ya estás inscrito
              </Button>
            ) : (
              <Button onClick={onEnroll}>Inscribirme</Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card text-left">
        <Tabs<TabKey>
          value={tab}
          onChange={setTab}
          items={[
            { key: "contenido", label: "Contenido" },
            { key: "comentarios", label: "Comentarios" },
            { key: "resumen", label: "Resumen" },
          ]}
        />

        {/* CONTENIDO */}
        <TabPanel tabKey="contenido" activeKey={tab}>
          {/* Header solo móvil */}
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <div className="text-xs font-semibold text-slate-700">
              {selectedLesson ? "Lección seleccionada" : "Selecciona una lección"}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
            {/* Columna izquierda: módulos y lecciones */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  Módulos y lecciones
                </div>
              </div>

              {loadingContent ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Cargando contenido…
                </div>
              ) : contentError === "no_enrollment" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Debes estar inscrito en este curso para ver el contenido. Usa el
                  botón “Inscribirme” arriba.
                </div>
              ) : modules.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  Este curso aún no tiene módulos.
                </div>
              ) : (
                <div className="space-y-3">
                  {modules
                    .slice()
                    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
                    .map((m) => {
                      const items = lessons
                        .filter((l) => l.module === m.id)
                        .slice()
                        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

                      return (
                        <AccordionItem key={m.id} title={m.titulo}>
                          {items.length === 0 ? (
                            <div className="text-sm text-slate-600">Sin lecciones.</div>
                          ) : (
                            <div className="space-y-2">
                              {items.map((l) => {
                                const done = completedLessonIds.has(l.id);
                                const isSelected = l.id === selectedLessonId;
                                return (
                                  <div
                                    key={l.id}
                                    className={
                                      "flex cursor-pointer flex-col gap-2 rounded-lg border bg-slate-50 p-3 transition-colors sm:flex-row sm:items-center sm:justify-between " +
                                      (isSelected
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 hover:bg-slate-100")
                                    }
                                    onClick={() => setSelectedLessonId(l.id)}
                                  >
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-slate-900">
                                        {l.titulo}
                                      </div>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5">
                                          {l.tipo === "video"
                                            ? "Video"
                                            : l.tipo === "texto"
                                            ? "Texto"
                                            : "Archivo"}
                                        </span>
                                        {(l.url_video || l.contenido || l.archivo) && (
                                          <span>
                                            Haz clic para ver el contenido.
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {done ? (
                                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 transition-transform duration-200 ease-out animate-[pop_0.25s_ease-out]">
                                          Completada
                                        </span>
                                      ) : (
                                        <Button
                                          variant="secondary"
                                          className="transition-transform duration-150 hover:-translate-y-0.5"
                                          onClick={(ev) => {
                                            ev.stopPropagation();
                                            onCompleteLesson(l.id);
                                          }}
                                          disabled={!user || !enrolled}
                                        >
                                          Marcar completada
                                        </Button>
                                      )}
                                    </div>

                                    {(!user || !enrolled) && (
                                      <div className="text-xs text-slate-500 sm:hidden">
                                        Inicia sesión e inscríbete para marcar
                                        progreso.
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </AccordionItem>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Columna derecha: contenido principal de la lección */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {!selectedLesson ? (
                <div className="text-sm text-slate-600">
                  Selecciona una lección para ver su contenido.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedLesson.titulo}
                  </div>

                  {selectedLesson.tipo === "video" && selectedLesson.url_video ? (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                      <video
                        key={selectedLesson.url_video}
                        controls
                        className="h-full w-full"
                        src={selectedLesson.url_video}
                      />
                    </div>
                  ) : null}

                  {selectedLesson.tipo === "texto" && selectedLesson.contenido && (
                    <div className="prose prose-sm max-w-none text-slate-800">
                      {selectedLesson.contenido}
                    </div>
                  )}

                  {selectedLesson.tipo === "archivo" && selectedLesson.archivo && (
                    <div className="text-sm text-slate-700">
                      <p className="mb-2">
                        Este recurso está disponible como archivo descargable.
                      </p>
                      <a
                        href={selectedLesson.archivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Descargar archivo
                      </a>
                    </div>
                  )}

                  {!selectedLesson.url_video &&
                    !selectedLesson.contenido &&
                    !selectedLesson.archivo && (
                      <div className="text-sm text-slate-600">
                        Esta lección aún no tiene contenido asignado.
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </TabPanel>


        {/* COMENTARIOS */}
        <TabPanel tabKey="comentarios" activeKey={tab}>
          <div className="space-y-4">
            {user ? (
              <form onSubmit={onPostComment} className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Escribe tu comentario
                </label>

                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Comparte tu opinión sobre el curso..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={postingComment || !commentText.trim()}
                  >
                    Publicar comentario
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                Inicia sesión para escribir comentarios.
              </div>
            )}

            {loadingComments ? (
              <div className="text-sm text-slate-600">Cargando comentarios…</div>
            ) : comments.length === 0 ? (
              <div className="text-sm text-slate-600">
                Aún no hay comentarios.
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <div className="mb-1 text-xs text-slate-500">
                      Usuario
                      {c.fecha ? " · " + new Date(c.fecha).toLocaleString() : ""}
                    </div>
                    <div className="text-slate-800">{c.texto}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabPanel>

        {/* RESUMEN / RATING */}
        <TabPanel tabKey="resumen" activeKey={tab}>
          <div className="space-y-4">
            {avgRating && ratingsCount > 0 ? (
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  Calificación promedio: {avgRating.toFixed(1)} / 5
                </div>
                <div className="text-xs text-slate-600">
                  Basado en {ratingsCount} calificaciones.
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Este curso aún no tiene calificaciones.
              </div>
            )}

            {user ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-900">Tu calificación</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onRate(v)}
                      disabled={ratingBusy}
                      className={
                        "text-2xl " +
                        (v <= myRating ? "text-yellow-400" : "text-slate-300") +
                        " hover:text-yellow-500 disabled:opacity-60"
                      }
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                Inicia sesión para calificar este curso.
              </div>
            )}
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
