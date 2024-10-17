import {DataTypes} from 'sequelize';
import sequelize from '../../config/sql';

const User = sequelize.define('User',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emailId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    tbkcredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

const SearchFlight = sequelize.define('SearchFlight',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FlightFrom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FlightTo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    DepartureDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    ReturnDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    travelClass: {
        type: DataTypes.STRING,
        allowNull: false
    },
    TravelerNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE
    }
});

const AirportList = sequelize.define('AirportList',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cityName: DataTypes.STRING,
    cityCode: DataTypes.STRING,
    countryCode: DataTypes.STRING,
    airportCode: DataTypes.STRING,
    countryName: DataTypes.STRING,
    airportName: DataTypes.STRING
});

const Setting = sequelize.define('Setting',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    TboTokenId: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

const TravellerDetails = sequelize.define('TravellerDetails',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    travelerType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passportNo: DataTypes.STRING,
    passportExpiry: DataTypes.STRING,
    passportissuingCountry: DataTypes.STRING,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: DataTypes.DATE,
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

const BookingDetails = sequelize.define('BookingDetails',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    bookingId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    TraceId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    PNR: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    InvoiceAmount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bookedDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    InvoiceNo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    InvoiceId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    IsLCC: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    flightStatus: DataTypes.STRING,
    ChangeRequestId: DataTypes.STRING,
    Segments: {
        type: DataTypes.JSON,
        allowNull: false
    },
    Passenger: {
        type: DataTypes.JSON,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

const CancelledFlights = sequelize.define('CancelledFlights',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    flightData: {
        type: DataTypes.JSON,
        allowNull: false
    },
    cancelledDate: DataTypes.DATE,
    CancellationCharge: DataTypes.STRING,
    ServiceTaxOnRAF: DataTypes.STRING,
    ChangeRequestId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ChangeRequestStatus: DataTypes.STRING,
    CreditNoteCreatedOn: DataTypes.DATE,
    CreditNoteNo: DataTypes.STRING,
    KrishiKalyanCess: DataTypes.STRING,
    RefundedAmount: DataTypes.STRING,
    refundExpectedBy: DataTypes.DATE,
    refundRequestRaised: DataTypes.DATE,
    SwachhBharatCess: DataTypes.STRING,
    TicketId: DataTypes.JSON,
    TraceId: DataTypes.STRING,
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

const UnsuccesfullFlights = sequelize.define('UnsuccesfullFlights',{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    totalAmount: DataTypes.STRING,
    bookedDate: DataTypes.DATE,
    flightStatus: DataTypes.STRING,
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    Origin: DataTypes.STRING,
    Destination: DataTypes.STRING,
    OriginDate: DataTypes.DATE,
    DestinationDate: DataTypes.DATE
});

// Define associations
User.hasMany(BookingDetails);
User.hasMany(CancelledFlights);
User.hasMany(UnsuccesfullFlights);
User.hasMany(TravellerDetails);

BookingDetails.belongsTo(User);
CancelledFlights.belongsTo(User);
UnsuccesfullFlights.belongsTo(User);
TravellerDetails.belongsTo(User);