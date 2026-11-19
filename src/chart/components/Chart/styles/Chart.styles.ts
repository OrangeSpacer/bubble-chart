import styled from 'styled-components';

export const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 280px;
  overflow: hidden;
  border-radius: 8px;

  > div {
    position: absolute;
    inset: 0;
  }
`;
