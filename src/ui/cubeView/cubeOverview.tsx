import React, { useContext } from 'react'
import { CubeViewModelContext } from './useCubeViewModel'
import ReactMarkdown from 'react-markdown'
import { MD_RENDERERS, REMARK_PLUGINS } from '../md'
import { CUBE_SOURCE_TO_LABEL } from '../component/cube/sourceIcon'

export interface CubeOverviewProps {

}

export function CubeOverview({}: CubeOverviewProps) {
    const { cube } = useContext(CubeViewModelContext);
    const hasDescription = cube.description.length > 0;

    return hasDescription
      ? <div className="cube-overview">
          <div className="margin-200 cover-image-container">
            {cube.cover_image && <>
              <img
                className="cover-image"
                src={cube.cover_image.uri}
                alt={`${cube.name}'s cover image`}
              />
              <em>Illus. {cube.cover_image.artist}</em>
            </>}
          </div>
          <div className="margin-200 cube-description">
            <ReactMarkdown
              remarkPlugins={REMARK_PLUGINS}
              components={MD_RENDERERS}
              children={cube.description} />
          </div>
        </div>

      : <em className="description-not-found">This cube doesn't have an overview. {cube.source !== "list" &&
        <>If your cube has a description on {CUBE_SOURCE_TO_LABEL[cube.source]}, use the refresh button to get the latest cube data.</>}
      </em>;
}

