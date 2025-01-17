import { add, format, compareDesc, parseISO } from "date-fns";
import { FocusBoundary, Layout, Link } from "@components";
import {
  loadAllMd,
  loadMdBySlug,
  processMd,
  Transcript as TranscriptFrontmatter,
} from "@helpers/retrieveMdPages";
import { pick } from "@helpers/object";

export default function Transcript({
  all,
  title,
  date,
  html,
}: Awaited<ReturnType<typeof getStaticProps>>["props"]) {
  return (
    <Layout title="Transcripts" sidebar as={undefined} description={undefined}>
      {(setSidebar: any) => (
        <>
          <h1>{title}</h1>
          <FocusBoundary
            onChange={setSidebar}
            onEnter={undefined}
            onExit={undefined}
          >
            <nav>
              <ol>
                {all.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={"/transcripts/" + article.slug}
                      title={article.title}
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </FocusBoundary>
          <div>
            <p>
              <em>
                Transcript from{" "}
                {format(add(parseISO(date), { days: 1 }), "EEEE PPP")}
              </em>
            </p>
            <div
              className="markdown"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </>
      )}
    </Layout>
  );
}

export const getStaticProps = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const doc = await loadMdBySlug<TranscriptFrontmatter>(
    "src/transcripts",
    params.slug,
  );

  const transcripts = await loadAllMd<TranscriptFrontmatter>("src/transcripts");
  const all = transcripts
    .filter((x) => Boolean(x) && x.content !== "")
    .map((x) => pick(["slug", "date", "title"], x))
    .sort((a, b) =>
      a.date && b.date ? compareDesc(parseISO(a.date), parseISO(b.date)) : 1,
    );

  return {
    props: {
      all,
      ...pick(["title", "date"], doc),
      html: processMd(doc.content).html,
    },
  };
};

export const getStaticPaths = async () => {
  const transcripts = await loadAllMd<TranscriptFrontmatter>("src/transcripts");
  return {
    paths: transcripts.map(({ slug }) => ({ params: { slug } })),
    fallback: false,
  };
};
