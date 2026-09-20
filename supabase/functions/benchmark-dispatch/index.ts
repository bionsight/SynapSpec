// Supabase Storage의 "benchmark-runs" 버킷에 <run 폴더>/meta.yaml이 새로 올라오면
// (parquet+meta 업로드가 끝났다는 신호로 삼는다) GitHub repository_dispatch를 호출해서
// .github/workflows/benchmark-from-parquet.yml을 깨운다.
//
// 아직 배포/테스트한 적 없음 — Supabase 프로젝트를 만든 뒤:
//
//   1. bucket 생성: benchmark-runs
//   2. 배포:
//        supabase functions deploy benchmark-dispatch
//   3. 시크릿 설정:
//        supabase secrets set GITHUB_TOKEN=<repo에 대한 fine-grained PAT, contents:none, actions... 최소 권한>
//        supabase secrets set GITHUB_REPO=bionsight/SynapSpec
//   4. Database Webhook 연결 (Supabase 대시보드 → Database → Webhooks):
//        table: storage.objects, events: INSERT
//        조건: name이 "benchmark-runs/%/meta.yaml" 패턴일 때만 (아래 코드에서도 한 번 더 거른다)
//        타깃: 이 함수의 URL
//
// GitHub 쪽 PAT 스코프: repository_dispatch를 쏘는 용도이므로 "Contents: Read and write"
// 정도면 충분하다 (repository_dispatch 자체는 별도 세분화된 권한이 없다 — repo 전체 권한이
// 아니라 fine-grained PAT를 이 저장소 하나로 한정해서 최소화할 것).

interface StorageInsertPayload {
  type: string;
  table: string;
  record: {
    name: string;
    bucket_id: string;
  };
}

Deno.serve(async (req: Request) => {
  let payload: StorageInsertPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("JSON body가 아님", { status: 400 });
  }

  const objectPath = payload.record?.name ?? "";
  if (payload.record?.bucket_id !== "benchmark-runs") {
    return new Response("benchmark-runs 버킷이 아님, 무시", { status: 200 });
  }

  // "<run 폴더>/meta.yaml" 만 반응한다 — precursors.parquet이 먼저 올라와도 무시하고,
  // 두 파일이 다 올라온 뒤(meta.yaml이 나중에 올라온다는 업로드 순서를 전제로) 딱 한 번 트리거.
  const match = objectPath.match(/^(.+)\/meta\.yaml$/);
  if (!match) {
    return new Response("meta.yaml 업로드가 아님, 무시", { status: 200 });
  }
  const storagePath = match[1];

  const githubToken = Deno.env.get("GITHUB_TOKEN");
  const githubRepo = Deno.env.get("GITHUB_REPO");
  if (!githubToken || !githubRepo) {
    return new Response("GITHUB_TOKEN/GITHUB_REPO 시크릿이 설정되지 않음", { status: 500 });
  }

  const dispatchResponse = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "benchmark-upload",
      client_payload: { storage_path: storagePath },
    }),
  });

  if (!dispatchResponse.ok) {
    const text = await dispatchResponse.text();
    return new Response(`GitHub dispatch 실패: ${dispatchResponse.status} ${text}`, { status: 502 });
  }

  return new Response(`dispatched: ${storagePath}`, { status: 200 });
});
