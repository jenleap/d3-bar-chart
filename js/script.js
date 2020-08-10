
const margin = {
    top: 10,
    right: 10,
    bottom: 20,
    left: 30
};
const height = 400 - (margin.top + margin.bottom);
const width = 1000 - (margin.right + margin.left);
const barWidth = 10;
const barOffset = 5;

const bgColour = '#f0f0f5';
const barColour = '#5c5c8a';
const barHover = '#b3b3cc';

d3.csv('js/data/COVID19_cases.csv', (data) => {
    const dateLabel = data.columns[8];
    const numsByDate = {};
    data.forEach((item) => {
        if (item[dateLabel] in numsByDate) {
            numsByDate[item[dateLabel]] += 1;
        } else {
            numsByDate[item[dateLabel]] = 1;
        }
    });

    const dateArr = Object.entries(numsByDate);
    dateArr.sort((a, b) => {
        return new Date(a[0]) - new Date(b[0]);
    });

    const totalNums = dateArr.map(date => date[1]);
    const totalDates = dateArr.map(date => new Date(date[0]));
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(totalNums)])
        .range([0, height]);

    const yAxisValues = d3.scaleLinear()
        .domain([0, d3.max(totalNums)])
        .range([height, 0]);

    const yAxisTicks = d3.axisLeft(yAxisValues)
        .ticks(10);

    const xScale = d3.scaleBand()
        .domain(dateArr)
        .paddingInner(0.2)
        .paddingOuter(0.3)
        .range([0, width]);

    const xAxisValues = d3.scaleTime()
        .domain([totalDates[0], totalDates[(totalDates.length - 1)]])
        .range([0, width]);

    const xAxisTicks = d3.axisBottom(xAxisValues)
        .ticks(d3.timeMonth.every(1));

    const toolTip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('padding', '10px')
        .style('background', 'white')
        .style('opacity', 0)
        .style('text-align', 'center')
        .style('font-weight', 'bold');

    const covidChart = d3.select('#viz').append('svg')
        .attr('width', width + (margin.left + margin.right))
        .attr('height', height + (margin.top + margin.bottom))
        .style('background', bgColour)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .selectAll('rect').data(dateArr)
        .enter().append('rect')
            .style('fill', barColour)
            .attr('width', (d) => xScale.bandwidth())
            .attr('height', 0)
            .attr('x', (d) => xScale(d))
            .attr('y', height)
            .on('mouseover', function(d) {
                toolTip.transition().duration(100)
                    .style('opacity', 0.9)

                toolTip.html(d[0] + '</br>' + d[1])
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top', (d3.event.pageY + 20) + 'px')

                d3.select(this)
                    .style('fill', barHover)
            })
            .on('mouseout', function(d) {
                toolTip.transition().duration(100)
                    .style('opacity', 0)

                d3.select(this)
                    .style('fill', barColour)
        });

    const yGuide = d3.select('#viz svg').append('g')
        .attr('transform', 'translate(30,' + margin.top + ')')
        .call(yAxisTicks);

    const xGuide = d3.select('#viz svg').append('g')
        .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
        .call(xAxisTicks);

    covidChart.transition()
        .attr('height', (d) => yScale(d[1]))
        .attr('y', (d) => height - yScale(d[1]))
        .delay((d, i) => i * 20)
        .duration(1000);
});

