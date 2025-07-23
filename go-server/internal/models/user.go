package models

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// User represents the user model
type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username     string             `bson:"username" json:"username"`
	Password     string             `bson:"password" json:"password"`
	Taisan       string             `bson:"taisan" json:"taisan"`
	IDWeb        int                `bson:"idweb" json:"idweb"`
	ImageAvatar  string             `bson:"imageavatar" json:"imageavatar"`
	LoginFirstAt time.Time          `bson:"loginFirstAt" json:"loginFirstAt"`
	LastLoginAt  time.Time          `bson:"lastLoginAt" json:"lastLoginAt"`
	Type         int                `bson:"type" json:"type"`
	Cookie       string             `bson:"cookie,omitempty" json:"cookie,omitempty"`
}

// UserRepository handles user database operations
type UserRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *mongo.Database) *UserRepository {
	return &UserRepository{
		collection: db.Collection("users"),
	}
}

// AddNewUser creates a new user
func (r *UserRepository) AddNewUser(user *User) error {
	if user.LoginFirstAt.IsZero() {
		user.LoginFirstAt = time.Now()
	}

	_, err := r.collection.InsertOne(context.Background(), user)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		return err
	}
	return nil
}

// FindUserByUsername finds a user by username
func (r *UserRepository) FindUserByUsername(username string) (*User, error) {
	var user User
	filter := bson.M{"username": username}

	err := r.collection.FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // User not found
		}
		log.Printf("Error finding user: %v", err)
		return nil, err
	}

	return &user, nil
}

// UpdateInfoUser updates user information
func (r *UserRepository) UpdateInfoUser(username string, updates *User) error {
	filter := bson.M{"username": username}
	update := bson.M{
		"$set": bson.M{
			"password":    updates.Password,
			"taisan":      updates.Taisan,
			"imageavatar": updates.ImageAvatar,
			"lastLoginAt": time.Now(),
		},
	}

	_, err := r.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		log.Printf("Error updating user: %v", err)
		return err
	}

	return nil
}

// Database connection
var DB *mongo.Database

// ConnectDatabase initializes MongoDB connection
func ConnectDatabase(mongoURI string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return err
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return err
	}

	DB = client.Database("autochat")
	log.Printf("Connected to MongoDB: %s", mongoURI)
	return nil
}
