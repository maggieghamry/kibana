/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import theme from '@elastic/eui/dist/eui_theme_light.json';
import cytoscape from 'cytoscape';
import { CSSProperties } from 'react';
import {
  DESTINATION_ADDRESS,
  SERVICE_NAME
} from '../../../../../../../plugins/apm/common/elasticsearch_fieldnames';
import { defaultIcon, iconForNode } from './icons';

export const animationOptions: cytoscape.AnimationOptions = {
  duration: parseInt(theme.euiAnimSpeedNormal, 10),
  // @ts-ignore The cubic-bezier options here are not recognized by the cytoscape types
  easing: theme.euiAnimSlightBounce
};
const lineColor = '#C5CCD7';
const zIndexNode = 200;
const zIndexEdge = 100;
const zIndexEdgeHighlight = 110;
const zIndexEdgeHover = 120;
export const nodeHeight = parseInt(theme.avatarSizing.l.size, 10);

function isService(el: cytoscape.NodeSingular) {
  return el.data(SERVICE_NAME) !== undefined;
}

const style: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': 'white',
      // The DefinitelyTyped definitions don't specify that a function can be
      // used here.
      //
      // @ts-ignore
      'background-image': (el: cytoscape.NodeSingular) =>
        iconForNode(el) ?? defaultIcon,
      'background-height': (el: cytoscape.NodeSingular) =>
        isService(el) ? '60%' : '40%',
      'background-width': (el: cytoscape.NodeSingular) =>
        isService(el) ? '60%' : '40%',
      'border-color': (el: cytoscape.NodeSingular) =>
        el.hasClass('primary') || el.selected()
          ? theme.euiColorPrimary
          : theme.euiColorMediumShade,
      'border-width': 2,
      color: theme.textColors.default,
      // theme.euiFontFamily doesn't work here for some reason, so we're just
      // specifying a subset of the fonts for the label text.
      'font-family': 'Inter UI, Segoe UI, Helvetica, Arial, sans-serif',
      'font-size': theme.euiFontSizeXS,
      ghost: 'yes',
      'ghost-offset-x': 0,
      'ghost-offset-y': 2,
      'ghost-opacity': 0.15,
      height: nodeHeight,
      label: (el: cytoscape.NodeSingular) =>
        isService(el) ? el.data(SERVICE_NAME) : el.data(DESTINATION_ADDRESS),
      'min-zoomed-font-size': theme.euiSizeL,
      'overlay-opacity': 0,
      shape: (el: cytoscape.NodeSingular) =>
        isService(el) ? 'ellipse' : 'diamond',
      'text-background-color': theme.euiColorLightestShade,
      'text-background-opacity': 0,
      'text-background-padding': theme.paddingSizes.xs,
      'text-background-shape': 'roundrectangle',
      'text-margin-y': theme.paddingSizes.s,
      'text-max-width': '200px',
      'text-valign': 'bottom',
      'text-wrap': 'ellipsis',
      width: theme.avatarSizing.l.size,
      'z-index': zIndexNode
    }
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'taxi',
      // @ts-ignore
      'taxi-direction': 'rightward',
      'line-color': lineColor,
      'overlay-opacity': 0,
      'target-arrow-color': lineColor,
      'target-arrow-shape': 'triangle',
      // The DefinitelyTyped definitions don't specify this property since it's
      // fairly new.
      //
      // @ts-ignore
      'target-distance-from-node': theme.paddingSizes.xs,
      width: 1,
      'source-arrow-shape': 'none',
      'z-index': zIndexEdge
    }
  },
  {
    selector: 'edge[bidirectional]',
    style: {
      'source-arrow-shape': 'triangle',
      'source-arrow-color': lineColor,
      'target-arrow-shape': 'triangle',
      // @ts-ignore
      'source-distance-from-node': theme.paddingSizes.xs,
      'target-distance-from-node': theme.paddingSizes.xs
    }
  },
  // @ts-ignore DefinitelyTyped says visibility is "none" but it's
  // actually "hidden"
  {
    selector: 'edge[isInverseEdge]',
    style: { visibility: 'hidden' }
  },
  // @ts-ignore
  {
    selector: '.invisible',
    style: { visibility: 'hidden' }
  },
  {
    selector: 'edge.nodeHover',
    style: {
      width: 4,
      // @ts-ignore
      'z-index': zIndexEdgeHover
    }
  },
  {
    selector: 'node.hover',
    style: {
      'border-width': 4
    }
  },
  {
    selector: 'edge.highlight',
    style: {
      width: 2,
      'line-color': theme.euiColorPrimary,
      'source-arrow-color': theme.euiColorPrimary,
      'target-arrow-color': theme.euiColorPrimary,
      // @ts-ignore
      'z-index': zIndexEdgeHighlight
    }
  }
];

// The CSS styles for the div containing the cytoscape element. Makes a
// background grid of dots.
export const cytoscapeDivStyle: CSSProperties = {
  background: `linear-gradient(
  90deg,
  ${theme.euiPageBackgroundColor}
    calc(${theme.euiSizeL} - calc(${theme.euiSizeXS} / 2)),
  transparent 1%
)
center,
linear-gradient(
  ${theme.euiPageBackgroundColor}
    calc(${theme.euiSizeL} - calc(${theme.euiSizeXS} / 2)),
  transparent 1%
)
center,
${theme.euiColorLightShade}`,
  backgroundSize: `${theme.euiSizeL} ${theme.euiSizeL}`,
  margin: `-${theme.gutterTypes.gutterLarge}`,
  marginTop: 0
};

export const cytoscapeOptions: cytoscape.CytoscapeOptions = {
  autoungrabify: true,
  boxSelectionEnabled: false,
  maxZoom: 3,
  minZoom: 0.2,
  style
};
