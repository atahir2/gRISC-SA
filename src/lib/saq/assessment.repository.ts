/**
 * SAQ runtime persistence via Supabase.
 * Static questionnaire config remains file-based (questionnaire.data.json).
 */

import { createClient } from "@/src/lib/supabase/client";
import type {
  AssessmentScopeSelectionRow,
  AssessmentAnswerRow,
  AssessmentActionItemRow,
} from "@/src/lib/supabase/database.types";
import type { Assessment } from "./assessment.types";

import type { ScopeSelection, AssessmentAnswer } from "./assessment.types";

export type ActionMetadata = {
  effortRequired?: "Low" | "Medium" | "High";
  leader?: string;
  deadline?: string;
  status?: "Planned" | "In Progress" | "Completed";
  remarks?: string;
};

function rowToAssessment(row: { id: string; organisation_name: string; created_at: string; updated_at: string }): Assessment {
  return {
    id: row.id,
    organisationName: row.organisation_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function scopeToRow(assessmentId: string, s: ScopeSelection): Omit<AssessmentScopeSelectionRow, "id" | "created_at" | "updated_at"> {
  return {
    assessment_id: assessmentId,
    scope_id: s.scopeId,
    in_scope: s.inScope,
    target_capability: s.targetCapability ?? null,
  };
}

function rowToScope(assessmentId: string, row: AssessmentScopeSelectionRow): ScopeSelection {
  return {
    assessmentId,
    scopeId: row.scope_id,
    inScope: row.in_scope,
    targetCapability: row.target_capability as 1 | 2 | 3 | undefined,
  };
}

function answerToRow(assessmentId: string, a: AssessmentAnswer): Omit<AssessmentAnswerRow, "id" | "created_at" | "updated_at"> {
  return {
    assessment_id: assessmentId,
    question_id: a.questionId,
    selected_score: a.selectedScore ?? null,
  };
}

function rowToAnswer(assessmentId: string, row: AssessmentAnswerRow): AssessmentAnswer {
  return {
    assessmentId,
    questionId: row.question_id,
    selectedScore: row.selected_score as 1 | 2 | 3 | undefined,
  };
}

export async function createAssessment(organisationName: string): Promise<Assessment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .insert({ organisation_name: organisationName })
    .select("id, organisation_name, created_at, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToAssessment(data);
}

export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, organisation_name, created_at, updated_at")
    .eq("id", assessmentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToAssessment(data) : null;
}

export async function listAssessments(): Promise<Assessment[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id, organisation_name, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToAssessment);
}

export async function saveScopeSelections(
  assessmentId: string,
  scopeSelections: ScopeSelection[]
): Promise<void> {
  const supabase = createClient();
  const rows = scopeSelections.map((s) => scopeToRow(assessmentId, s));
  const { error } = await supabase.from("assessment_scope_selections").upsert(rows, {
    onConflict: "assessment_id,scope_id",
  });
  if (error) throw new Error(error.message);
  await supabase.from("assessments").update({ updated_at: new Date().toISOString() }).eq("id", assessmentId);
}

export async function loadScopeSelections(assessmentId: string): Promise<ScopeSelection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessment_scope_selections")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToScope(assessmentId, row as AssessmentScopeSelectionRow));
}

export async function saveAnswers(
  assessmentId: string,
  answers: AssessmentAnswer[]
): Promise<void> {
  const supabase = createClient();
  const rows = answers.map((a) => answerToRow(assessmentId, a));
  const { error } = await supabase.from("assessment_answers").upsert(rows, {
    onConflict: "assessment_id,question_id",
  });
  if (error) throw new Error(error.message);
  await supabase.from("assessments").update({ updated_at: new Date().toISOString() }).eq("id", assessmentId);
}

export async function loadAnswers(assessmentId: string): Promise<AssessmentAnswer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessment_answers")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToAnswer(assessmentId, row as AssessmentAnswerRow));
}

export async function saveActionMetadata(
  assessmentId: string,
  actionMetadataByQuestionId: Record<string, ActionMetadata>
): Promise<void> {
  const supabase = createClient();
  const rows = Object.entries(actionMetadataByQuestionId).map(([question_id, m]) => ({
    assessment_id: assessmentId,
    question_id,
    effort_required: m.effortRequired ?? null,
    leader: m.leader ?? null,
    deadline: m.deadline ?? null,
    status: m.status ?? null,
    remarks: m.remarks ?? null,
  }));
  if (rows.length === 0) return;
  const { error } = await supabase.from("assessment_action_items").upsert(rows, {
    onConflict: "assessment_id,question_id",
  });
  if (error) throw new Error(error.message);
  await supabase.from("assessments").update({ updated_at: new Date().toISOString() }).eq("id", assessmentId);
}

export async function loadActionMetadata(
  assessmentId: string
): Promise<Record<string, ActionMetadata>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessment_action_items")
    .select("*")
    .eq("assessment_id", assessmentId);
  if (error) throw new Error(error.message);
  const out: Record<string, ActionMetadata> = {};
  for (const row of data ?? []) {
    const r = row as AssessmentActionItemRow;
    out[r.question_id] = {
      effortRequired: r.effort_required as ActionMetadata["effortRequired"],
      leader: r.leader ?? undefined,
      deadline: r.deadline ?? undefined,
      status: r.status as ActionMetadata["status"],
      remarks: r.remarks ?? undefined,
    };
  }
  return out;
}
