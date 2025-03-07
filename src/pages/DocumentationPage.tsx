import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/documentation.css';
import { Container } from "@mui/material";
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Layout } from '../uicomponents/shared/layout';

// 直接导入 .md 文件
import doc1 from '../docs/1-what-is-fatex.md?raw';
import doc2 from '../docs/2-fatex-check-in-feature.md?raw';
import doc3 from '../docs/3-fatex-lottery-feature.md?raw';
import doc4 from '../docs/4-fatex-dual-mining-feature-grow-and-fatex.md?raw';
import doc5 from '../docs/5-fatex-league-s1.md?raw';

// 定义文档内容对象
const docContents: { [key: string]: string } = {
    '1、What is FateX.md': doc1,
    '2、FateX Check-in Feature.md': doc2,
    '3、FateX Raffle Feature.md': doc3,
    '4、FateX Dual Mining Feature.md': doc4,
    '5、Fatex League S1.md': doc5,
};

interface HeadingInfo {
  text: string;
  level: number;
  id: string;
}

export function Documentation() {
  const { file } = useParams<{ file?: string }>();
  const docFiles = Object.keys(docContents); // 从 docContents 获取文件名列表
  const defaultDoc = docFiles[0]; // 默认第一个文档
  const [activeDoc, setActiveDoc] = useState(file || defaultDoc);
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);

  const extractHeadings = (content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));
    return matches.map(match => ({
      text: match[2],
      level: match[1].length,
      id: match[2].toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
    }));
  };

  useEffect(() => {
    if (docContents[activeDoc]) {
      const newHeadings = extractHeadings(docContents[activeDoc]);
      setHeadings(newHeadings);
    }
  }, [activeDoc]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <Container className="app-container">
        <div className="documentation-layout">
          <div className="documentation-sidebar">
            {docFiles.map((fileName) => (
              <div key={fileName}>
                <div
                  className={`sidebar-item ${activeDoc === fileName ? 'active' : ''}`}
                  onClick={() => setActiveDoc(fileName)}
                >
                  {fileName.replace('.md', '')}
                </div>
                <div className="sidebar-subitems">
                  {activeDoc === fileName && headings.map((heading, index) => (
                    <div
                      key={index}
                      className={`sidebar-subitem level-${heading.level}`}
                      onClick={() => scrollToHeading(heading.id)}
                    >
                      {heading.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="documentation-content">
            <ReactMarkdown
              children={docContents[activeDoc] || 'Document not found'}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ node, ...props }) => {
                  const id = props.children && typeof props.children === 'string'
                    ? props.children.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
                    : '';
                  return <h1 id={id} {...props} />;
                },
                h2: ({ node, ...props }) => {
                  const id = props.children && typeof props.children === 'string'
                    ? props.children.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
                    : '';
                  return <h2 id={id} {...props} />;
                },
                h3: ({ node, ...props }) => {
                  const id = props.children && typeof props.children === 'string'
                    ? props.children.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
                    : '';
                  return <h3 id={id} {...props} />;
                },
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
        </div>
      </Container>
    </Layout>
  );
}