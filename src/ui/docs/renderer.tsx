import { Link } from 'react-router-dom'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScryfallIcon } from '../component/scryfallIcon'
import { CoglibIcon } from '../component/coglibIcon'
import { Components } from 'react-markdown/lib/ast-to-react'

export const idificate = (idifiable: any) =>
  idifiable.toString()
    .replace(/ /g, "-")
    .replace(/"/g, "")

export const renderer = {
  a: ({node, ...props}) => {
    const { href, children, ...rest} = props
    if (href.startsWith("/")) {
      return <Link to={href} {...rest}>{children}</Link>
    } else {
      return <a href={href} {...rest}>{children}</a>
    }
  },
  h2: ({node, ...props}) => {
    const { children, ...rest} = props;
    const id = idificate(children)
    return <h2 id={id} {...rest}>
      <a href={`#${id}`}>#</a>
      {" "}
      {children}
    </h2>
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
  }
  // pre: ({ node, ...props }) => {
  //   // useHighlightPrism([]);
  //   console.log(node);
  //   const copyText = node.children[0]?.children[0]?.value;
  //   return <div className=''>
  //     <CopyToClipboardButton copyText={copyText} className='copy-button' />
  //     <pre {...props} />
  //   </div>
  // },

}

interface MCDocProps {
  children: string;
  className?: string;
  overrides?: Components
}
/**
 * default config for Document section in ReactMarkdown.
 */
export const MDDoc = ({ children, className }: MCDocProps) => {
  return <ReactMarkdown
    className={className}
    remarkPlugins={[remarkGfm]}
    components={renderer}>
    {children}
  </ReactMarkdown>
}