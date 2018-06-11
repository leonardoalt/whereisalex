/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card, { CardMedia, CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  card: {
    width: 250,
    minHeight: 200,
    marginRight: 12,
    marginTop: 12,
  },
  media: {
    height: 250,
  },
});

const CheckIn = withStyles(styles)((props) => {
  const {
    classes,
    id,
	airport,
	timestamp,
    toggleCheckIns
  } = props;
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="headline" component="h2">
          {airport}
        </Typography>
        <Typography component="p">
          {timestamp}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => toggleCheckIns(id)}
        >
          Bets
          </Button>
      </CardActions>
    </Card>
  );
});

CheckIn.propTypes = {
  whereIsAlexContract: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  airport: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  toggleCheckIns: PropTypes.func.isRequired
};

export { CheckIn };
