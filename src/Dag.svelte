<script lang="ts">
    import * as d3 from 'd3';
    import dagreD3 from 'dagre-d3';

    import { selectedWorkflow, selectedStep } from './stores';

    import { onMount } from 'svelte';

    let el: SVGSVGElement;
    let workflow: string;
    let source: string;
    let target: string;
    let doCreateEdge: boolean = false;

    var g = new dagreD3.graphlib.Graph()
        .setGraph({ rankdir: 'LR', marginx: 20, marginy: 20, width: 500 })
        .setDefaultEdgeLabel(function () {
            return {};
        });
    
    g.setNode(1, {
        label: '1',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'LoadDatasetStep',
        description: "Load Dataset"
    });
    g.setNode(2, {
        label: '2',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'VariableSelectionStep',
        description: "Select Dependent Variable"
    });
    g.setNode(3, {
        label: '3',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'AssumptionCheckingStep',
        description: "Check Outlier"
    });
    g.setNode(4, {
        label: '4',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'VariableSelectionStep',
        description: "Select Independent Variable"
    });
    g.setNode(5, {
        label: '5',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'AssumptionCheckingStep',
        description: "Check Outlier"
    });
    g.setNode(6, {
        label: '6',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'TrainTestSplitStep',
        description: "Train Test Split"

    });
    g.setNode(7, {
        label: '7',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'ModelStep',
        description: "Model Training"
    });
    g.setNode(8, {
        label: '8',
        style: 'fill: #5069d9',
        shape: 'circle',
        class: 'EvaluationStep',
        description: "Evaluation"
    });

    var num = 8;

    g.setEdge(1, 2, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(2, 3, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(1, 4, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(2, 4, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(4, 5, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(3, 6, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(5, 6, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(6, 7, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(6, 8, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });
    g.setEdge(7, 8, {
        arrowheadClass: 'normal',
        style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
    });

    // Set some general styles
    g.nodes().forEach(function (v) {
        var node = g.node(v);
        node.rx = node.ry = 5;
    });

    var render = new dagreD3.render();

    $: workflow = $selectedWorkflow;

    function createEdge(graph, source, target) {
        graph.setEdge(parseInt(source), parseInt(target), {
            arrowheadClass: 'normal',
            style: 'stroke: #3690e0; stroke-width: 1.5px; fill: none'
        });
        renderWorkflow();
        doCreateEdge = false;
        (source = undefined), (target = undefined);
    }

    function renderWorkflow() {
        var svg = d3.select(el);
        var svgGroup = svg.select('g');
        render(svgGroup, g);

        var zoom = d3.zoom().on('zoom', function (event) {
            svgGroup.attr('transform', event.transform);
        });
        svg.call(zoom);

        var initialScale = 0.75;
        svg.call(
            zoom.transform,
            d3.zoomIdentity
                .translate(
                    (svg.attr('width') - g.graph().width * initialScale) / 2,
                    20
                )
                .scale(initialScale)
        );

        svg.attr('height', g.graph().height * initialScale + 40);

        svgGroup.selectAll('.label').attr('transform', 'translate(-4,-7)');

        svgGroup.selectAll(".node")
                .append("g")
                .attr("class","description")
                .attr("transform","translate(-4,12)")
                .append("text")
                .attr("font-size","9px")
                .attr("text-anchor","middle")
                .text(d => g.node(String(d)).description);


        var tooltips = svgGroup
            .selectAll('.node')
            .append('g')
            .attr('class', 'dag-tooltip')
            .attr('visibility', 'hidden');

        tooltips
            .append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .on('click', (event, d) => {
                doCreateEdge = true;
                source = String(d);
                event.stopPropagation();
            });

        tooltips
            .append('text')
            .attr('transform', 'translate(1,8.5)')
            .style('text-align', 'center')
            .text('+');

        svgGroup.selectAll('.node').on('click', (event, d) => {
            if (doCreateEdge) {
                target = String(d);
                createEdge(g, source, target);
            }
            var tooltip = d3
                .select(d3.select(event.target).node().parentNode)
                .select('.dag-tooltip');
            if (tooltip.attr('visibility') === 'hidden') {
                tooltip.attr('visibility', 'visible');
            } else {
                tooltip.attr('visibility', 'hidden');
            };
        });


        svgGroup.selectAll(".AssumptionCheckingStep")
                .on("dblclick",(event,d) => {
                  d3.select(d3.select(event.target).node().parentNode)
                    .append("rect")
                    .attr("width",60)
                    .attr("height",60)
                    .attr("x",-25)
                    .attr("y",-25)
                    .attr("rx",6)
                    .style("fill","#b1bced")
                    .on("click",(event,d) => {
                      d3.select(event.target)
                      .attr("visibility","hidden");
                    });
                  
                  d3.select(d3.select(event.target).node().parentNode)
                    .append("image")
                    .attr("width",50)
                    .attr("height",50)
                    .attr("transform","translate(-20,-20)")
                    .attr("href","./outlier.jpg")
                    .on("click",(event,d) => {
                      d3.select(event.target)
                      .attr("visibility","hidden");
                    });
                });

        svgGroup.selectAll(".DataTransformationStep")
                .on("dblclick",(event,d) => {

                  d3.select(d3.select(event.target).node().parentNode)
                    .append("rect")
                    .attr("width",125)
                    .attr("height",150)
                    .attr("x",-62.5)
                    .attr("y",-75)
                    .attr("rx",20)
                    .style("fill","#b1bced");
                  
                  var text = d3.select(d3.select(event.target).node().parentNode)
                    .append("text")
                    .attr("transform","translate(-50,-50)")
                    .style("font-size","8px");
                  
                  text.append("tspan")
                    .text("Select a Data Transformation Method");

                  text.append("tspan")
                    .text("Or define a data transformation method")
                  
                });
    }

    onMount(() => {
        renderWorkflow();
    });

    function addNode(cls, graph) {
        if (cls !== undefined) {
            num = num + 1;
            graph.setNode(num, {
                label: String(num),
                style: 'fill: #5069d9',
                shape: 'circle',
                class: cls
            });

            g.setGraph({
                rankdir: 'LR',
                marginx: 20,
                marginy: 20,
                width: 500
            }).setDefaultEdgeLabel(function () {
                return {};
            });
            renderWorkflow();
        }
    }
    $: addNode($selectedStep, g);
</script>

<svg
    bind:this={el}
    class="w-full h-full"
    viewBox="0 0 500 200"
    visibility={workflow === 'RegressionFlow' ? 'visible' : 'hidden'}><g /></svg
>
