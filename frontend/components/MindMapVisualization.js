import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function MindMapVisualization({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(data.edges)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.type === 'center' ? 40 : d.type === 'category' ? 30 : 20)
      .attr('fill', d => {
        switch (d.type) {
          case 'center': return '#3b82f6';
          case 'category': return '#64748b';
          case 'item': return '#10b981';
          default: return '#6b7280';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add text to nodes
    node.append('text')
      .text(d => d.text)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'center' ? 0 : 4)
      .attr('font-size', d => d.type === 'center' ? '14px' : d.type === 'category' ? '12px' : '10px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .call(wrapText, 80);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Text wrapping function
    function wrapText(text, width) {
      text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));
        let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
          }
        }
      });
    }

  }, [data]);

  return (
    <div className="w-full overflow-auto">
      <svg ref={svgRef} className="border rounded-lg bg-white"></svg>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Легенда:</strong></p>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Центр (вы)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-500 rounded-full mr-2"></div>
            <span>Категории</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div>
            <span>Конкретные ответы</span>
          </div>
        </div>
        <p className="mt-2">* Перетаскивайте узлы для лучшего вида</p>
      </div>
    </div>
  );
}