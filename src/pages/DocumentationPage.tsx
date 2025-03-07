import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/documentation.css';
import { Container} from "@mui/material";

import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Layout } from '../uicomponents/shared/layout';

const docFiles = [
    '1.What is FateX.md',
    '2.FateX Check-in Feature.md',
    '3.FateX Lottery Feature.md',
    '4.FateX Dual Mining Feature (Grow & FateX).md',
    '5.FateX League S1.md'
];

interface HeadingInfo {
    text: string;
    level: number;
    id: string;
}

export function Documentation() {
    const [markdownContents, setMarkdownContents] = useState<{ [key: string]: string }>({});
    const [activeDoc, setActiveDoc] = useState(docFiles[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [headings, setHeadings] = useState<HeadingInfo[]>([]);

    const extractHeadings = (content: string) => {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches = Array.from(content.matchAll(headingRegex));
        return matches.map(match => ({
            text: match[2],
            level: match[1].length,
            id: match[2].toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
        }));
    };
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

    useEffect(() => {
        if (markdownContents[activeDoc]) {
            const newHeadings = extractHeadings(markdownContents[activeDoc]);
            setHeadings(newHeadings);
        }
    }, [activeDoc, markdownContents]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return <div className="documentation-loading">loading...</div>;
    }

    return (
        <Layout>
        <Container className="app-container">
            <div className="documentation-layout">
                <div className="documentation-sidebar">
                    {docFiles.map((file) => (
                        <div key={file}>
                            <div
                                className={`sidebar-item ${activeDoc === file ? 'active' : ''}`}
                                onClick={() => setActiveDoc(file)}
                            >
                                {file.replace('.md', '')}
                            </div>
                            <div className="sidebar-subitems">
                                {activeDoc === file && headings.map((heading, index) => (
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
                        children={markdownContents[activeDoc] || ''}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h1: ({node, ...props}) => <h1 id={props.children.toString().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')} {...props} />,
                            h2: ({node, ...props}) => <h2 id={props.children.toString().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')} {...props} />,
                            h3: ({node, ...props}) => <h3 id={props.children.toString().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')} {...props} />,
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