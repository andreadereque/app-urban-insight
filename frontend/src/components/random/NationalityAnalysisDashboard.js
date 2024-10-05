import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GenderDistributionAnalysis from './GenderDistributionAnalysis';  // Gender Distribution Chart
import AgeGroupComparisonRadar from './AgeGroupComparisonRadar';  // Age Group Radar Chart
import ElderlyPopulationDoughnut from './ElderlyPopulationDoughnut';  // Elderly Population Doughnut Chart

const NationalityAnalysisDashboard = () => {
  return (
    <Container fluid className="py-4">
      <h2 className="my-4 text-center">Nationality and Demographics Dashboard</h2>

      {/* First Row: Gender Distribution and Age Group Comparison */}
      <Row className="mb-4">
        <Col md={6} className="d-flex justify-content-center">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <GenderDistributionAnalysis />  {/* Gender Distribution Chart */}
          </div>
        </Col>
        <Col md={6} className="d-flex justify-content-center">
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <AgeGroupComparisonRadar />  {/* Age Group Comparison Radar Chart */}
          </div>
        </Col>
      </Row>

      {/* Second Row: Elderly Population Doughnut */}
      <Row>
        <Col md={12} className="d-flex justify-content-center">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <ElderlyPopulationDoughnut />  {/* Elderly Population Doughnut Chart */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NationalityAnalysisDashboard;
