import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/documentation.css';
import { Container} from "@mui/material";

import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Layout } from '../components/shared/layout';

const docFiles = [
    '1.What is FateX.md',
    '2.FateX Check-in Feature.md',
    '3.FateX Lottery Feature.md',
    '4.FateX Dual Mining Feature (Grow & FateX).md',
    '5.FateX League S1.md'
];



export function Documentation() {
    const [markdownContents, setMarkdownContents] = useState<{ [key: string]: string }>({});
    const [activeDoc, setActiveDoc] = useState(docFiles[0]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAllDocs = async () => {
            setIsLoading(true);
            const contents: { [key: string]: string } = {};
            
            for (const file of docFiles) {
                try {
                    const response = await fetch(`/docs/${file}`);
                    const text = await response.text();
                    contents[file] = text;
                } catch (error) {
                    console.error(`Error loading ${file}:`, error);
                    contents[file] = 'loading error';
                }
            }
            
            setMarkdownContents(contents);
            setIsLoading(false);
        };

        loadAllDocs();
    }, []);

    if (isLoading) {
        return <div className="documentation-loading">loading...</div>;
    }

    return (
        <Layout>
      <Container className="app-container">
        <div className="documentation-layout">
            <div className="documentation-sidebar">
                {docFiles.map((file) => (
                    <div
                        key={file}
                        className={`sidebar-item ${activeDoc === file ? 'active' : ''}`}
                        onClick={() => setActiveDoc(file)}
                    >
                        {file.replace('.md', '')}
                    </div>
                ))}
            </div>
            <div className="documentation-content">
                <ReactMarkdown 
                    children={markdownContents[activeDoc] || ''}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code({node, inline, className, children, ...props}) {
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
                        }
                    }}
                />
            </div>
        </div>
        </Container>
        </Layout>
    );
}