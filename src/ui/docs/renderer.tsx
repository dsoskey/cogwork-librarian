import { Link } from 'react-router-dom'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScryfallIcon } from '../icons/scryfallIcon'
import { CoglibIcon } from '../icons/coglibIcon'
import { Components } from 'react-markdown/lib/ast-to-react'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'
import { MultiQueryActionBar } from '../component/editor/multiQueryActionBar'

export const titleificate = (titleable: string) => {
  const [title] = titleable.split("\n\n")
  return title.replace(/^#+\s+/, "")
}
export const idificate = (idifiable: any) =>
  idifiable.toString()
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/["\/]/g, "")

export const renderer = {
  a: ({node, ...props}) => {
    const { href, children, ...rest} = props
    if (href.startsWith("/")) {
      return <Link to={href} {...rest}>{children}</Link>
    } else {
      return <a href={href} {...rest}>{children}</a>
    }
  },
  h3: ({node, ...props}) => {
    const { children, ...rest} = props;
    const id = idificate(children)
    return <h3 id={id} {...rest}>
      <a href={`#${id}`}>#</a>
      {" "}
      {children}
    </h3>
  },
  td: ({node, ...props}) => {
    const { children, ...rest } = props;
    let component = children;
    if (children?.length === 1) {
      if (children[0] === "👁️") {
        component = <ScryfallIcon size="20px"/>;
      } else if (children[0] === "⚙️") {
        component = <CoglibIcon   size="20px"/>;
      }
    }
    return <td {...rest}>{component}</td>
  },
}

export function newPre({ node, ...props }) {
  const copyText = node.children[0]?.children[0]?.value;
  return <div className='text-editor-root'>
    <MultiQueryActionBar
      queries={copyText.split("\n")}
      copyText={()=>{}}
      gutterColumns={["line-numbers", "multi-info"]}
    />
    <CopyToClipboardButton copyText={copyText} className='copy-button' />
    <pre className="display" {...props} />
  </div>
}

interface MCDocProps {
  children: string;
  className?: string;
  overrides?: Components
}
/**
 * default config for Document section in ReactMarkdown.
 */
export const MDDoc = ({ children, className, overrides }: MCDocProps) => {
  return <ReactMarkdown
    className={className}
    remarkPlugins={[remarkGfm]}
    components={{...renderer, ...overrides}}>
    {children}
  </ReactMarkdown>
}